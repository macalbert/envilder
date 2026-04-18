namespace Envilder.Infrastructure;

using Amazon;
using Amazon.Runtime.CredentialManagement;
using Amazon.SimpleSystemsManagement;
using Envilder.Domain;
using Envilder.Domain.Ports;
using Envilder.Infrastructure.Aws;
using Envilder.Infrastructure.Azure;
using global::Azure.Identity;
using global::Azure.Security.KeyVault.Secrets;
using System;

/// <summary>
/// Creates the appropriate <see cref="ISecretProvider"/> implementation
/// based on the map file configuration and optional runtime overrides.
/// </summary>
public static class SecretProviderFactory
{
	private static readonly RegionEndpoint FallbackRegion = RegionEndpoint.USEast1;

	/// <summary>
	/// Creates an <see cref="ISecretProvider"/> for the provider specified in
	/// <paramref name="config"/>. When <paramref name="options"/> is provided,
	/// its values take precedence over <paramref name="config"/>.
	/// </summary>
	/// <param name="config">Configuration from the <c>$config</c> section of a map file.</param>
	/// <param name="options">Optional runtime overrides (e.g. CLI flags).</param>
	/// <returns>A ready-to-use secret provider.</returns>
	/// <exception cref="InvalidOperationException">
	/// Thrown when Azure is selected but no Vault URL is provided.
	/// </exception>
	public static ISecretProvider Create(MapFileConfig config, EnvilderOptions? options = null)
	{
		if (config is null)
		{
			throw new ArgumentNullException(nameof(config));
		}

		var provider = options?.Provider ?? config.Provider;

		return provider switch
		{
			SecretProviderType.Azure => CreateAzureSecretProvider(config, options),
			_ => CreateAwsSecretProvider(config, options),
		};
	}

	private static AzureKeyVaultSecretProvider CreateAzureSecretProvider(MapFileConfig config, EnvilderOptions? options)
	{
		var vaultUrl = options?.VaultUrl ?? config.VaultUrl;

		if (string.IsNullOrWhiteSpace(vaultUrl))
		{
			throw new InvalidOperationException("Vault URL must be provided for Azure Key Vault provider.");
		}

		var secretClient = new SecretClient(new Uri(vaultUrl), new DefaultAzureCredential());
		return new(secretClient);
	}

	private static AwsSsmSecretProvider CreateAwsSecretProvider(MapFileConfig config, EnvilderOptions? options)
	{
		var profile = options?.Profile ?? config.Profile;

		if (!string.IsNullOrWhiteSpace(profile))
		{
			var profilesLocation = Environment.GetEnvironmentVariable("AWS_SHARED_CREDENTIALS_FILE");
			var chain = new CredentialProfileStoreChain(profilesLocation);
			if (chain.TryGetAWSCredentials(profile, out var credentials))
			{
				var region = ResolveProfileRegion(chain, profile!);
				return new(new AmazonSimpleSystemsManagementClient(credentials, region));
			}

			throw new InvalidOperationException(
				$"AWS profile '{profile}' was not found in the credential store.");
		}

		return new(new AmazonSimpleSystemsManagementClient());
	}

	private static RegionEndpoint ResolveProfileRegion(CredentialProfileStoreChain chain, string profile)
	{
		if (chain.TryGetProfile(profile, out var credentialProfile) && credentialProfile.Region != null)
		{
			return credentialProfile.Region;
		}

		return ResolveRegion();
	}

	/// <summary>
	/// Resolves the AWS region from environment variables (<c>AWS_REGION</c> or
	/// <c>AWS_DEFAULT_REGION</c>), falling back to <c>us-east-1</c> when neither is set.
	/// </summary>
	private static RegionEndpoint ResolveRegion()
	{
		var regionName = Environment.GetEnvironmentVariable("AWS_REGION")
			?? Environment.GetEnvironmentVariable("AWS_DEFAULT_REGION");

		return string.IsNullOrWhiteSpace(regionName)
			? FallbackRegion
			: RegionEndpoint.GetBySystemName(regionName);
	}
}