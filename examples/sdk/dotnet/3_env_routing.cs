// Environment-based routing: pick a different map file per environment
#:package Envilder@*
#:package Microsoft.Extensions.Hosting.Abstractions@*
#:property PublishAot=false

using Microsoft.Extensions.Hosting;
using static Envilder.Application.Envilder;

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? Environments.Production;

var secrets = await LoadAsync(env, new Dictionary<string, string?>
{
    [Environments.Development] = "../../../envilder.json",
    [Environments.Staging] = "../../../envilder.json",
    [Environments.Production] = "../../../envilder.json",
    ["test"] = null,  // no secrets loaded
});

foreach (var key in secrets.Keys)
    Console.WriteLine($"{key} = {Environment.GetEnvironmentVariable(key)}");
