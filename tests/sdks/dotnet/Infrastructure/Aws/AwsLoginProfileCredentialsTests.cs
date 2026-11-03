namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.Runtime.CredentialManagement;
using AwesomeAssertions;

// A profile created by `aws login` carries a `login_session` key. The AWS SDK
// resolves it through the AWSSDK.Signin assembly, which it loads by name. If
// the package is not shipped, users see "Assembly AWSSDK.Signin could not be
// found or loaded" instead of a credential error. The profile here has no
// cached session, so resolution is expected to fail, but never because the
// assembly is missing.
public class AwsLoginProfileCredentialsTests : IDisposable
{
	private const string ProfileName = "login-profile";
	private const string MissingAssemblyMarker = "could not be found or loaded";

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

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_NotFailOnMissingSigninAssembly_When_ProfileUsesAwsLogin()
	{
		// Arrange
		var chain = new SharedCredentialsFile(_configFile);
		var resolved = chain.TryGetProfile(ProfileName, out var profile);

		// Act
		Exception? actual = null;
		try
		{
			var credentials = AWSCredentialsFactory.GetAWSCredentials(profile, chain);
			await credentials.GetCredentialsAsync().WaitAsync(TestContext.Current.CancellationToken);
		}
		catch (Exception ex)
		{
			actual = ex;
		}

		// Assert
		resolved.Should().BeTrue();
		(actual?.ToString() ?? string.Empty).Should().NotContain(MissingAssemblyMarker);
	}
}