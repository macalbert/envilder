namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using AwesomeAssertions;
using Envilder.Infrastructure.Aws;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

public class AwsSsmSecretProviderTests
{
    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
    public async Task Should_ReturnSecret_When_AwsSsmParameterExists()
    {
        // Arrange
        var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
        ssmClient.GetParameterAsync(
                Arg.Is<GetParameterRequest>(r => r.Name == "/Test/Token" && r.WithDecryption),
                Arg.Any<CancellationToken>())
            .Returns(new GetParameterResponse
            {
                Parameter = new Parameter { Value = "secret-value-123" },
            });
        var sut = new AwsSsmSecretProvider(ssmClient);

        // Act
        var actual = await sut.GetSecretAsync("/Test/Token");

        // Assert
        actual.Should().Be("secret-value-123");
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
    public async Task Should_ReturnNull_When_AwsSsmParameterNotFound()
    {
        // Arrange
        var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
        ssmClient.GetParameterAsync(
                Arg.Any<GetParameterRequest>(),
                Arg.Any<CancellationToken>())
            .ThrowsAsync(new ParameterNotFoundException("not found"));
        var sut = new AwsSsmSecretProvider(ssmClient);

        // Act
        var actual = await sut.GetSecretAsync("/Test/NonExistent");

        // Assert
        actual.Should().BeNull();
    }
}
