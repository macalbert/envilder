namespace Envilder.Tests.Application;

using AwesomeAssertions;
using Envilder.Domain;
using EnvilderFacade = Envilder.Application.Envilder;

public class EnvilderFacadeTests
{
    [Fact]
    public void Should_ThrowArgumentException_When_ResolveFileCalledWithEmptyPath()
    {
        // Act
        var act = () => EnvilderFacade.ResolveFile(string.Empty);

        // Assert
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public async Task Should_ThrowArgumentException_When_ResolveFileAsyncCalledWithEmptyPath()
    {
        // Act
        var act = () => EnvilderFacade.ResolveFileAsync(string.Empty);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public void Should_ThrowFileNotFoundException_When_ResolveFileCalledWithNonExistentPath()
    {
        // Act
        var act = () => EnvilderFacade.ResolveFile("/nonexistent/map.json");

        // Assert
        act.Should().Throw<FileNotFoundException>();
    }

    [Fact]
    public async Task Should_ThrowFileNotFoundException_When_ResolveFileAsyncCalledWithNonExistentPath()
    {
        // Act
        var act = () => EnvilderFacade.ResolveFileAsync("/nonexistent/map.json");

        // Assert
        await act.Should().ThrowAsync<FileNotFoundException>();
    }

    [Fact]
    public void Should_ThrowArgumentException_When_LoadCalledWithEmptyPath()
    {
        // Act
        var act = () => EnvilderFacade.Load(string.Empty);

        // Assert
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public async Task Should_ThrowArgumentException_When_LoadAsyncCalledWithEmptyPath()
    {
        // Act
        var act = () => EnvilderFacade.LoadAsync(string.Empty);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public void Should_ReturnEmptyDictionary_When_EnvMappingValueIsNull()
    {
        // Arrange
        var mapping = new Dictionary<string, string?> { ["test"] = null };

        // Act
        var actual = EnvilderFacade.ResolveFile("test", mapping);

        // Assert
        actual.Should().BeEmpty();
    }

    [Fact]
    public void Should_ReturnEmptyDictionary_When_EnvNotInMapping()
    {
        // Arrange
        var mapping = new Dictionary<string, string?> { ["production"] = "prod.json" };

        // Act
        var actual = EnvilderFacade.ResolveFile("staging", mapping);

        // Assert
        actual.Should().BeEmpty();
    }

    [Fact]
    public void Should_ThrowArgumentException_When_EnvMappingValueIsEmpty()
    {
        // Arrange
        var mapping = new Dictionary<string, string?> { ["production"] = "  " };

        // Act
        var act = () => EnvilderFacade.ResolveFile("production", mapping);

        // Assert
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Should_ThrowArgumentException_When_EnvNameIsEmpty()
    {
        // Arrange
        var mapping = new Dictionary<string, string?> { ["production"] = "prod.json" };

        // Act
        var act = () => EnvilderFacade.ResolveFile(string.Empty, mapping);

        // Assert
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Should_ThrowArgumentException_When_FromFileCalledWithEmptyPath()
    {
        // Act
        var act = () => EnvilderFacade.FromFile(string.Empty);

        // Assert
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Should_ThrowFileNotFoundException_When_FluentResolveCalledWithNonExistentFile()
    {
        // Act
        var act = () => EnvilderFacade.FromFile("/nonexistent/map.json").Resolve();

        // Assert
        act.Should().Throw<FileNotFoundException>();
    }

    [Fact]
    public void Should_ReturnBuilder_When_FromFileCalled()
    {
        // Act
        var actual = EnvilderFacade.FromFile("/some/path.json");

        // Assert
        actual.Should().NotBeNull();
    }

    [Fact]
    public void Should_ReturnSameBuilder_When_WithProviderCalled()
    {
        // Arrange
        var builder = EnvilderFacade.FromFile("/some/path.json");

        // Act
        var actual = builder.WithProvider(SecretProviderType.Azure);

        // Assert
        actual.Should().BeSameAs(builder);
    }

    [Fact]
    public void Should_ReturnSameBuilder_When_WithProfileCalled()
    {
        // Arrange
        var builder = EnvilderFacade.FromFile("/some/path.json");

        // Act
        var actual = builder.WithProfile("my-profile");

        // Assert
        actual.Should().BeSameAs(builder);
    }

    [Fact]
    public void Should_ReturnSameBuilder_When_WithVaultUrlCalled()
    {
        // Arrange
        var builder = EnvilderFacade.FromFile("/some/path.json");

        // Act
        var actual = builder.WithVaultUrl("https://vault.azure.net");

        // Assert
        actual.Should().BeSameAs(builder);
    }

    [Fact]
    public void Should_SupportFullFluentChain_When_AllOverridesApplied()
    {
        // Act
        var actual = EnvilderFacade.FromFile("/some/path.json")
            .WithProvider(SecretProviderType.Azure)
            .WithVaultUrl("https://vault.azure.net")
            .WithProfile("my-profile");

        // Assert
        actual.Should().NotBeNull();
    }
}
