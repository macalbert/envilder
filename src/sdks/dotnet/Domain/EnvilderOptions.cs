namespace Envilder;

using System.Collections.Generic;

/// <summary>
/// Runtime overrides supplied by the consumer (e.g. CLI flags).
/// Values set here take precedence over <see cref="MapFileConfig"/>.
/// </summary>
public class EnvilderOptions
{
	/// <summary>
	/// Override the secret provider backend defined in the map file.
	/// </summary>
	public SecretProviderType? Provider { get; set; }

	/// <summary>
	/// Override the Azure Key Vault URL defined in the map file.
	/// </summary>
	public string? VaultUrl { get; set; }

	/// <summary>
	/// Override the AWS named profile defined in the map file.
	/// </summary>
	public string? Profile { get; set; }

	/// <summary>
	/// Extra Azure Key Vault host suffixes to trust on top of the public, China,
	/// US Government and Germany cloud hosts (e.g. <c>.localhost.localstack.cloud</c>).
	/// By default the Vault URL must be <c>https://</c> and its host must end with
	/// <c>.vault.azure.net</c>, <c>.vault.azure.cn</c>, <c>.vault.usgovcloudapi.net</c>
	/// or <c>.vault.microsoftazure.de</c>.
	/// </summary>
	public IList<string>? AllowedVaultHosts { get; set; }
}