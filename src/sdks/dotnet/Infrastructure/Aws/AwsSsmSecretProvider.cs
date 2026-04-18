namespace Envilder.Infrastructure.Aws;

using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using Envilder.Domain.Ports;
using System;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// <see cref="ISecretProvider"/> backed by AWS Systems Manager Parameter Store.
/// Parameters are retrieved with decryption enabled so that <c>SecureString</c>
/// values are returned in plain text.
/// </summary>
public class AwsSsmSecretProvider : ISecretProvider
{
	private readonly IAmazonSimpleSystemsManagement _ssmClient;

	/// <summary>
	/// Initializes a new instance using the supplied SSM client.
	/// </summary>
	/// <param name="ssmClient">A configured <see cref="IAmazonSimpleSystemsManagement"/> instance.</param>
	public AwsSsmSecretProvider(IAmazonSimpleSystemsManagement ssmClient)
	{
		_ssmClient = ssmClient ?? throw new ArgumentNullException(nameof(ssmClient));
	}

	/// <inheritdoc />
	public async Task<string?> GetSecretAsync(string name, CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(name))
		{
			throw new ArgumentException("Secret name cannot be null or whitespace.", nameof(name));
		}

		try
		{
			var response = await _ssmClient.GetParameterAsync(new() { Name = name, WithDecryption = true }, cancellationToken);
			return response.Parameter.Value;
		}
		catch (ParameterNotFoundException)
		{
			return null;
		}
	}

	/// <inheritdoc />
	public string? GetSecret(string name)
	{
		if (string.IsNullOrWhiteSpace(name))
		{
			throw new ArgumentException("Secret name cannot be null or whitespace.", nameof(name));
		}

		try
		{
			using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
#pragma warning disable VSTHRD002 // AWS SDK v4 has no synchronous GetParameter API
			var response = _ssmClient.GetParameterAsync(new() { Name = name, WithDecryption = true }, cts.Token).GetAwaiter().GetResult();
#pragma warning restore VSTHRD002
			return response.Parameter.Value;
		}
		catch (ParameterNotFoundException)
		{
			return null;
		}
	}
}