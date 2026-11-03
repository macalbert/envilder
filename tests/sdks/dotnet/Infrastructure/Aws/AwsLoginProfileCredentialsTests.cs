namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.Runtime;
using Amazon.Runtime.CredentialManagement;
using AwesomeAssertions;

// A profile created by `aws login` carries a `login_session` key. The AWS SDK
// resolves it through the AWSSDK.Signin assembly, which it loads by name. If
// the package is not shipped, users see "Assembly AWSSDK.Signin could not be
// found or loaded" instead of a credential error. The SDK checks for the
// assembly when it builds the credentials, so building them from a login
// profile is enough to catch a missing package.
public class AwsLoginProfileCredentialsTests : IDisposable
{
	private const string ProfileName = "login-profile";

	private readonly string _configFile = Path.Combine(Path.GetTempPath(), $"envilder-aws-config-{Guid.NewGuid():N}");

	public AwsLoginProfileCredentialsTests()
	{
		File.WriteAllText(
			_configFile,
			$"""
			[profile {ProfileName}]
			login_session = arn:aws:iam::123456789012:user/envilder-test
			region = us-east-1
			""");
	}

	public void Dispose()
	{
		File.Delete(_configFile);
		GC.SuppressFinalize(this);
	}

	[Fact]
	public void Should_BuildCredentials_When_ProfileUsesAwsLogin()
	{
		// Arrange
		var chain = new SharedCredentialsFile(_configFile);
		var resolved = chain.TryGetProfile(ProfileName, out var profile);

		// Act
		var act = () => AWSCredentialsFactory.GetAWSCredentials(profile, chain);

		// Assert
		resolved.Should().BeTrue();
		act.Should().NotThrow().Which.Should().BeOfType<LoginAWSCredentials>();
	}
}