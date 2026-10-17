namespace Envilder.Tests.Fixtures;

using Azure.Core;
using System.Net;
using System.Text.Json;

/// <summary>
/// Minimal in-process token endpoint speaking the App Service managed identity
/// protocol (<c>IDENTITY_ENDPOINT</c> + <c>IDENTITY_HEADER</c>). It lets
/// <c>DefaultAzureCredential</c>, used by the SDK factory, obtain tokens from
/// the LocalStack for Azure emulator: MSAL's instance discovery rejects the
/// emulator authority, so <c>EnvironmentCredential</c> cannot be used.
/// </summary>
internal sealed class ManagedIdentityEndpointStub : IAsyncDisposable
{
	private const string IdentityHeaderName = "X-IDENTITY-HEADER";
	private const string DefaultScopeSuffix = "/.default";

	private readonly TokenCredential _credential;
	private readonly HttpListener _listener = new();
	private readonly Task _serveLoop;

	public ManagedIdentityEndpointStub(TokenCredential credential, int port)
	{
		_credential = credential;
		Endpoint = new Uri($"http://localhost:{port}/msi/token");
		IdentityHeader = Guid.NewGuid().ToString("N");

		// Only "localhost" prefixes can be registered without elevation on Windows.
		_listener.Prefixes.Add($"http://localhost:{port}/");
		_listener.Start();
		_serveLoop = ServeAsync();
	}

	public Uri Endpoint { get; }

	public string IdentityHeader { get; }

	public async ValueTask DisposeAsync()
	{
		_listener.Close();

		// The serve loop is owned by this instance and ends once the listener closes.
#pragma warning disable VSTHRD003
		await _serveLoop;
#pragma warning restore VSTHRD003
	}

	private async Task ServeAsync()
	{
		while (_listener.IsListening)
		{
			HttpListenerContext context;
			try
			{
				context = await _listener.GetContextAsync();
			}
			catch (Exception ex) when (ex is HttpListenerException or ObjectDisposedException)
			{
				return;
			}

			try
			{
				await HandleAsync(context);
			}
			catch (Exception ex)
			{
				await WriteAsync(context.Response, HttpStatusCode.InternalServerError, new { error = ex.Message });
			}
		}
	}

	private async Task HandleAsync(HttpListenerContext context)
	{
		var request = context.Request;
		if (request.Headers[IdentityHeaderName] != IdentityHeader)
		{
			await WriteAsync(context.Response, HttpStatusCode.Unauthorized, new { error = "invalid identity header" });
			return;
		}

		var resource = request.QueryString["resource"]
			?? request.QueryString["scope"]
			?? request.QueryString["scopes"];
		if (string.IsNullOrWhiteSpace(resource))
		{
			await WriteAsync(context.Response, HttpStatusCode.BadRequest, new { error = "missing resource" });
			return;
		}

		var scope = resource.EndsWith(DefaultScopeSuffix, StringComparison.Ordinal)
			? resource
			: resource.TrimEnd('/') + DefaultScopeSuffix;

		var token = await _credential.GetTokenAsync(new TokenRequestContext([scope]), CancellationToken.None);

		await WriteAsync(context.Response, HttpStatusCode.OK, new Dictionary<string, string>
		{
			["access_token"] = token.Token,
			["expires_on"] = token.ExpiresOn.ToUnixTimeSeconds().ToString(System.Globalization.CultureInfo.InvariantCulture),
			["resource"] = resource,
			["token_type"] = "Bearer",
		});
	}

	private static async Task WriteAsync(HttpListenerResponse response, HttpStatusCode status, object body)
	{
		response.StatusCode = (int)status;
		response.ContentType = "application/json";
		await JsonSerializer.SerializeAsync(response.OutputStream, body);
		response.Close();
	}
}