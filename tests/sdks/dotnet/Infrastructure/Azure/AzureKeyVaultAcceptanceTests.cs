namespace Envilder.Tests.Infrastructure.Azure;

using AwesomeAssertions;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Infrastructure.Azure;
using global::Azure.Core.Pipeline;
using global::Azure.Identity;
using global::Azure.Security.KeyVault.Secrets;
using System.Net.Http;

public class AzureKeyVaultAcceptanceTests : IAsyncLifetime
{
    private IContainer _lowkeyVault = null!;
    private SecretClient _secretClient = null!;
    private string _vaultUrl = null!;

    public async Task InitializeAsync()
    {
        _lowkeyVault = new ContainerBuilder("nagyesta/lowkey-vault:7.1.32")
            .WithPortBinding(8443, true)
            .WithPortBinding(8080, true)
            .WithEnvironment("LOWKEY_ARGS", "--server.port=8443 --LOWKEY_VAULT_RELAXED_PORTS=true")
            .WithWaitStrategy(Wait.ForUnixContainer()
                .UntilExternalTcpPortIsAvailable(8443))
            .Build();

        await _lowkeyVault.StartAsync();

        var host = _lowkeyVault.Hostname;
        var vaultPort = _lowkeyVault.GetMappedPublicPort(8443);
        var tokenPort = _lowkeyVault.GetMappedPublicPort(8080);

        _vaultUrl = $"https://{host}:{vaultPort}";

        Environment.SetEnvironmentVariable("IDENTITY_ENDPOINT", $"http://{host}:{tokenPort}/metadata/identity/oauth2/token");
        Environment.SetEnvironmentVariable("IDENTITY_HEADER", "dummy");

        var httpHandler = new HttpClientHandler();
        httpHandler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;

        var clientOptions = new SecretClientOptions(SecretClientOptions.ServiceVersion.V7_2)
        {
            Transport = new HttpClientTransport(new HttpClient(httpHandler)),
            DisableChallengeResourceVerification = true,
        };

        _secretClient = new SecretClient(
            new Uri(_vaultUrl),
            new DefaultAzureCredential(),
            clientOptions);
    }

    public async Task DisposeAsync()
    {
        Environment.SetEnvironmentVariable("IDENTITY_ENDPOINT", null);
        Environment.SetEnvironmentVariable("IDENTITY_HEADER", null);

        if (_lowkeyVault != null)
        {
            await _lowkeyVault.DisposeAsync();
        }
    }

    [Fact(Timeout = CancellationTokenForTest.LongTimeout)]
    public async Task Should_ResolveSecretFromKeyVault_When_SecretExistsInLowkeyVault()
    {
        // Arrange
        await _secretClient.SetSecretAsync("test-secret", "vault-secret-value");

        var provider = new AzureKeyVaultSecretProvider(_secretClient);
        var sut = new EnvilderClient(provider);
        var mapFile = new ParsedMapFile
        {
            Config = new MapFileConfig
            {
                Provider = SecretProviderType.Azure,
                VaultUrl = _vaultUrl,
            },
            Mappings = new Dictionary<string, string>
            {
                ["VAULT_SECRET"] = "test-secret",
            },
        };

        // Act
        var actual = await sut.ResolveSecretsAsync(mapFile);

        // Assert
        actual.Should().ContainKey("VAULT_SECRET");
        actual["VAULT_SECRET"].Should().Be("vault-secret-value");
    }

    [Fact(Timeout = CancellationTokenForTest.LongTimeout)]
    public async Task Should_ReturnEmptyForMissingKeyVaultSecret_When_SecretDoesNotExist()
    {
        // Arrange
        var provider = new AzureKeyVaultSecretProvider(_secretClient);
        var client = new EnvilderClient(provider);
        var mapFile = new ParsedMapFile
        {
            Config = new MapFileConfig
            {
                Provider = SecretProviderType.Azure,
                VaultUrl = _vaultUrl,
            },
            Mappings = new Dictionary<string, string>
            {
                ["MISSING"] = "nonexistent-secret",
            },
        };

        // Act
        var actual = await client.ResolveSecretsAsync(mapFile);

        // Assert
        actual.Should().BeEmpty();
    }
}