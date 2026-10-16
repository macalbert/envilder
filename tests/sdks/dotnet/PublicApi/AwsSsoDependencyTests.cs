// The AWS SDK loads the SSO and SSO OIDC assemblies by name, through
// reflection, when it builds credentials for an SSO or IAM Identity Center
// profile. Nothing in Envilder references their types at compile time, so a
// missing package reference only shows up for users as
// "Assembly AWSSDK.SSOOIDC could not be found". The test project gets these
// assemblies only through its reference to the SDK, so these tests fail if
// the SDK stops shipping them.
namespace UserContract;

using AwesomeAssertions;
using System.Reflection;

public class AwsSsoDependencyTests
{
	[Theory]
	[InlineData("AWSSDK.SSO")]
	[InlineData("AWSSDK.SSOOIDC")]
	public void Should_ShipAwsSsoAssembly_When_SdkIsReferenced(string assemblyName)
	{
		// Arrange
		var name = new AssemblyName(assemblyName);

		// Act
		var act = () => Assembly.Load(name);

		// Assert
		act.Should().NotThrow();
	}
}