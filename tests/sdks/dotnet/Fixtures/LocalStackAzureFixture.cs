namespace Envilder.Tests.Fixtures;

using Azure.Core;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.Text.Json.Nodes;

public sealed class LocalStackAzureFixture : IAsyncLifetime
{
	private const string Image = "localstack/localstack-azure:latest";

	// The emulator accepts any service principal in its single all-zero tenant
	// and subscription. These are placeholders, not secrets.
	private const string TenantId = "00000000-0000-0000-0000-000000000000";
	private const string SubscriptionId = "00000000-0000-0000-0000-000000000000";
	private const string ClientId = "any-app";
	private const string ClientSecret = "dummy";
	private const string ResourceGroup = "envilder-tests";
	private const string Location = "westeurope";
	private const string ManagementScope = "https://management.azure.com/.default";

	// Variables that would make DefaultAzureCredential pick a credential ahead of
	// ManagedIdentityCredential (and possibly reach real Azure). They are cleared
	// while the emulator runs and restored on dispose.
	private static readonly string[] CompetingAzureEnvVars =
	[
		"AZURE_TENANT_ID",
		"AZURE_CLIENT_ID",
		"AZURE_CLIENT_SECRET",
		"AZURE_CLIENT_CERTIFICATE_PATH",
		"AZURE_USERNAME",
		"AZURE_PASSWORD",
		"AZURE_FEDERATED_TOKEN_FILE",
		"AZURE_AUTHORITY_HOST",
		"AZURE_TOKEN_CREDENTIALS",
	];

	private static readonly string[] IdentityEnvVars =
	[
		"IDENTITY_ENDPOINT",
		"IDENTITY_HEADER",
	];

	private IContainer? _container;

	private ManagedIdentityEndpointStub? _identityEndpoint;

	private (string Name, string? Value)[] _originalEnvValues = [];

	public string VaultUrl { get; private set; } = null!;

	/// <summary>
	/// Client that authenticates like production code does, through
	/// <c>DefaultAzureCredential</c> and the local managed identity endpoint.
	/// The emulator serves reads without a token, so writes made with this
	/// client are what exercise that endpoint.
	/// </summary>
	public SecretClient SecretClient { get; private set; } = null!;

	public async ValueTask InitializeAsync()
	{
		var environment = await LocalStackEnvironment.LoadAsync();
		if (!environment.TryGetValue(LocalStackEnvironment.AuthTokenVariable, out var authToken)
			|| string.IsNullOrWhiteSpace(authToken))
		{
			throw new InvalidOperationException(
				$"{LocalStackEnvironment.AuthTokenVariable} could not be resolved from envilder.json.");
		}

		_originalEnvValues =
		[
			.. CompetingAzureEnvVars.Concat(IdentityEnvVars)
				.Select(v => (Name: v, Value: Environment.GetEnvironmentVariable(v)))
		];

		try
		{
			// Vault URIs embed the gateway port, so the host port must match the
			// port the emulator listens on inside the container.
			var port = FindFreePort();

			_container = new ContainerBuilder(Image)
				.WithName($"localstack-azure-{Guid.CreateVersion7()}")
				.WithPortBinding(port, port)
				.WithEnvironment(environment)
				.WithEnvironment("GATEWAY_LISTEN", $"0.0.0.0:{port}")
				.WithEnvironment("LOCALSTACK_HOST", $"localhost.localstack.cloud:{port}")
				.WithWaitStrategy(Wait.ForUnixContainer().UntilMessageIsLogged(@"Ready\."))
				.Build();

			await _container.StartAsync();

			// *.localhost.localstack.cloud resolves to 127.0.0.1 and is served
			// with a valid TLS certificate, so no certificate bypass is needed.
			var authorityHost = new Uri($"https://azure.localhost.localstack.cloud:{port}");
			var credential = new ClientSecretCredential(
				TenantId,
				ClientId,
				ClientSecret,
				new ClientSecretCredentialOptions
				{
					AuthorityHost = authorityHost,
					DisableInstanceDiscovery = true,
				});

			var vaultName = $"kv-{Guid.NewGuid():N}"[..11];
			VaultUrl = await CreateVaultAsync(authorityHost, credential, vaultName);

			// Lets DefaultAzureCredential (used by the SDK factory) reach the
			// emulator through its ManagedIdentityCredential.
			_identityEndpoint = new ManagedIdentityEndpointStub(credential, FindFreePort());
			foreach (var name in CompetingAzureEnvVars)
			{
				Environment.SetEnvironmentVariable(name, null);
			}

			Environment.SetEnvironmentVariable("IDENTITY_ENDPOINT", _identityEndpoint.Endpoint.AbsoluteUri);
			Environment.SetEnvironmentVariable("IDENTITY_HEADER", _identityEndpoint.IdentityHeader);

			SecretClient = new SecretClient(new Uri(VaultUrl), new DefaultAzureCredential());
		}
		catch
		{
			await DisposeAsync();
			throw;
		}
	}

	public async ValueTask DisposeAsync()
	{
		foreach (var (name, value) in _originalEnvValues)
		{
			Environment.SetEnvironmentVariable(name, value);
		}

		_originalEnvValues = [];

		if (_identityEndpoint is not null)
		{
			await _identityEndpoint.DisposeAsync();
			_identityEndpoint = null;
		}

		if (_container is not null)
		{
			await _container.DisposeAsync();
			_container = null;
		}
	}

	private static async Task<string> CreateVaultAsync(
		Uri managementUrl,
		TokenCredential credential,
		string vaultName)
	{
		var token = await credential.GetTokenAsync(
			new TokenRequestContext([ManagementScope]),
			CancellationToken.None);

		using var http = new HttpClient { BaseAddress = managementUrl };
		http.DefaultRequestHeaders.Authorization =
			new AuthenticationHeaderValue("Bearer", token.Token);

		var groupPath = $"/subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroup}";

		await ArmPutAsync(
			http,
			$"{groupPath}?api-version=2021-04-01",
			new { location = Location });

		var vault = await ArmPutAsync(
			http,
			$"{groupPath}/providers/Microsoft.KeyVault/vaults/{vaultName}?api-version=2023-07-01",
			new
			{
				location = Location,
				properties = new
				{
					tenantId = TenantId,
					sku = new { family = "A", name = "standard" },
					accessPolicies = Array.Empty<object>(),
				},
			});

		var vaultUri = vault["properties"]?["vaultUri"]?.GetValue<string>()
			?? throw new InvalidOperationException("ARM response did not include properties.vaultUri.");

		return vaultUri.TrimEnd('/');
	}

	private static async Task<JsonNode> ArmPutAsync(HttpClient http, string path, object body)
	{
		using var response = await http.PutAsJsonAsync(path, body);
		if (!response.IsSuccessStatusCode)
		{
			throw new InvalidOperationException(
				$"ARM request failed ({(int)response.StatusCode}): {await response.Content.ReadAsStringAsync()}");
		}

		return await response.Content.ReadFromJsonAsync<JsonNode>()
			?? throw new InvalidOperationException("ARM response body was empty.");
	}

	private static int FindFreePort()
	{
		var listener = new TcpListener(IPAddress.Loopback, 0);
		listener.Start();
		try
		{
			return ((IPEndPoint)listener.LocalEndpoint).Port;
		}
		finally
		{
			listener.Stop();
		}
	}
}