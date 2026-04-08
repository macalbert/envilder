namespace Envilder.Tests.Infrastructure.Azure;

using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Infrastructure.Azure;
using Envilder.Tests.Fixtures;

[Collection(nameof(ContainersCollection))]
public class AzureKeyVaultAcceptanceTests
{
    private readonly LowkeyVaultFixture _lowkeyVault;

    public AzureKeyVaultAcceptanceTests(LowkeyVaultFixture lowkeyVault)
    {
        _lowkeyVault = lowkeyVault;
    }

    [Fact(Timeout = CancellationTokenForTest.LongTimeout)]
    public async Task Should_ResolveSecretFromKeyVault_When_SecretExistsInLowkeyVault()
    {
        // Arrange
        await _lowkeyVault.SecretClient.SetSecretAsync("test-secret", "vault-secret-value");

        var provider = new AzureKeyVaultSecretProvider(_lowkeyVault.SecretClient);
        var sut = new EnvilderClient(provider);
        var mapFile = new ParsedMapFile(
            new MapFileConfig
            {
                Provider = SecretProviderType.Azure,
                VaultUrl = _lowkeyVault.VaultUrl,
            },
            new Dictionary<string, string>
            {
                ["VAULT_SECRET"] = "test-secret",
            });

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
        var provider = new AzureKeyVaultSecretProvider(_lowkeyVault.SecretClient);
        var client = new EnvilderClient(provider);
        var mapFile = new ParsedMapFile(
            new MapFileConfig
            {
                Provider = SecretProviderType.Azure,
                VaultUrl = _lowkeyVault.VaultUrl,
            },
            new Dictionary<string, string>
            {
                ["MISSING"] = "nonexistent-secret",
            });

        // Act
        var actual = await client.ResolveSecretsAsync(mapFile);

        // Assert
        actual.Should().BeEmpty();
    }
}