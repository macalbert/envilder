namespace Envilder.Tests.Doubles;

using global::Envilder.Domain.Ports;

public sealed class FakeCheckingSecretProvider : ISecretProvider, ISecretExistenceChecker
{
	public const string ResolvedValue = "resolved-secret-value-for-test";

	public Dictionary<string, SecretExistence> Existence { get; } = new();

	public Exception? CheckException { get; set; }

	public List<IReadOnlyCollection<string>> CheckedBatches { get; } = new();

	public List<CancellationToken> CheckTokens { get; } = new();

	public int CheckCalls => CheckedBatches.Count;

	public int GetSecretCalls { get; private set; }

	public Task<IReadOnlyDictionary<string, SecretExistence>> CheckSecretsExistAsync(
		IReadOnlyCollection<string> names,
		CancellationToken cancellationToken)
	{
		CheckedBatches.Add(names);
		CheckTokens.Add(cancellationToken);
		if (CheckException is not null)
		{
			throw CheckException;
		}

		return Task.FromResult<IReadOnlyDictionary<string, SecretExistence>>(
			names.Where(Existence.ContainsKey).ToDictionary(name => name, name => Existence[name]));
	}

	public Task<string?> GetSecretAsync(string name, CancellationToken cancellationToken = default)
	{
		GetSecretCalls++;
		return Task.FromResult<string?>(ResolvedValue);
	}

	public string? GetSecret(string name)
	{
		GetSecretCalls++;
		return ResolvedValue;
	}
}