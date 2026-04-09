namespace Envilder.Tests.Fixtures;

using DotNet.Testcontainers.Configurations;
using DotNet.Testcontainers.Containers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

internal sealed class LocalStackHealthCheck : IWaitUntil
{
    // More info: https://im5tu.io/article/2022/09/pro-testing-with-xunit-localstack/
    private readonly int _port;

    public LocalStackHealthCheck(int port)
    {
        _port = port;
    }

    public async Task<bool> UntilAsync(IContainer container)
    {
        var endpoint = new UriBuilder("http", container.Hostname, container.GetMappedPublicPort(_port)).Uri.AbsoluteUri;

        try
        {
            // https://github.com/localstack/localstack/pull/6716
            using var httpClient = new HttpClient { BaseAddress = new Uri(endpoint) };

            var result = await httpClient.GetFromJsonAsync<JsonNode>("/_localstack/init/ready");

            if (result is null)
            {
                return false;
            }

            //logger.LogInformation("Check if localstack is ready to go: {endpoint}_localstack/init/ready\n{response}", endpoint, result!.ToJsonString());

            var scripts = result["scripts"];
            if (scripts is null)
            {
                return false;
            }

            var initScripts = scripts.Deserialize<IEnumerable<Script>>() ?? [];
            if (!initScripts.Any())
            {
                return true;
            }

            foreach (var script in initScripts)
            {
                if (!"READY".Equals(script.Stage, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (!"init.sh".Equals(script.Name, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                return "SUCCESSFUL".Equals(script.State, StringComparison.OrdinalIgnoreCase);
            }

            return false;
        }
        catch (Exception)
        {
            return false;
        }
    }

    private record Script(
        [property: JsonPropertyName("stage")] string Stage,
        [property: JsonPropertyName("state")] string State,
        [property: JsonPropertyName("name")] string Name);
}