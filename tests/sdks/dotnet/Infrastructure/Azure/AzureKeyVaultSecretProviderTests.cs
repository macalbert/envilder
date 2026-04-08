namespace Envilder.Tests.Infrastructure.Azure;

using AwesomeAssertions;
using Envilder.Infrastructure.Azure;
using global::Azure;
using global::Azure.Security.KeyVault.Secrets;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

public class AzureKeyVaultSecretProviderTests
{
    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
    public async Task Should_ReturnSecret_When_AzureKeyVaultSecretExists()
    {
        // Arrange
        var secretClient = Substitute.For<SecretClient>();
        var secret = SecretModelFactory.KeyVaultSecret(
            properties: SecretModelFactory.SecretProperties(new Uri("https://vault.azure.net/secrets/test-secret")),
            value: "azure-secret-value");
        var response = Response.FromValue(secret, Substitute.For<Response>());
        secretClient.GetSecretAsync("test-secret", Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(response);
        var sut = new AzureKeyVaultSecretProvider(secretClient);

        // Act
        var actual = await sut.GetSecretAsync("test-secret");

        // Assert
        actual.Should().Be("azure-secret-value");
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
    public async Task Should_ReturnNull_When_AzureKeyVaultSecretNotFound()
    {
        // Arrange
        var secretClient = Substitute.For<SecretClient>();
        secretClient.GetSecretAsync("missing-secret", Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new RequestFailedException(404, "Secret not found"));
        var sut = new AzureKeyVaultSecretProvider(secretClient);

        // Act
        var actual = await sut.GetSecretAsync("missing-secret");

        // Assert
        actual.Should().BeNull();
    }
}
