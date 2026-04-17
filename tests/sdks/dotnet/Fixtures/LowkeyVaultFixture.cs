namespace Envilder.Tests.Fixtures;

using Azure.Core.Pipeline;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using System.Net.Http;

public sealed class LowkeyVaultFixture : IAsyncLifetime
{
    private const int VaultPort = 8443;
    private const int TokenPort = 8080;

    private IContainer _container = null!;

    public string VaultUrl { get; private set; } = null!;

    public SecretClient SecretClient { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        _container = new ContainerBuilder("nagyesta/lowkey-vault:7.1.61")
            .WithName($"lowkey-vault-{Guid.CreateVersion7()}")
            .WithPortBinding(VaultPort, true)
            .WithPortBinding(TokenPort, true)
            .WithEnvironment(
                "LOWKEY_ARGS",
                "--server.port=8443 --LOWKEY_VAULT_RELAXED_PORTS=true")
            .WithWaitStrategy(Wait.ForUnixContainer()
                .UntilExternalTcpPortIsAvailable(VaultPort))
            .Build();

        await _container.StartAsync();

        var host = _container.Hostname;
        var vaultPort = _container.GetMappedPublicPort(VaultPort);
        var tokenPort = _container.GetMappedPublicPort(TokenPort);

        VaultUrl = $"https://{host}:{vaultPort}";

        Environment.SetEnvironmentVariable(
            "IDENTITY_ENDPOINT",
            $"http://{host}:{tokenPort}/metadata/identity/oauth2/token");
        Environment.SetEnvironmentVariable(
            "IDENTITY_HEADER",
            "dummy");

        var httpHandler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback =
                HttpClientHandler
                    .DangerousAcceptAnyServerCertificateValidator,
        };

        var clientOptions = new SecretClientOptions(
            SecretClientOptions.ServiceVersion.V7_2)
        {
            Transport =
                new HttpClientTransport(new HttpClient(httpHandler)),
            DisableChallengeResourceVerification = true,
        };

        SecretClient = new SecretClient(
            new Uri(VaultUrl),
            new DefaultAzureCredential(),
            clientOptions);
    }

    public async Task DisposeAsync()
    {
        Environment.SetEnvironmentVariable("IDENTITY_ENDPOINT", null);
        Environment.SetEnvironmentVariable("IDENTITY_HEADER", null);

        await _container.DisposeAsync();
    }
}
