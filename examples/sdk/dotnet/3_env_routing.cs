// Environment-based routing: pick a different map file per environment
#:package Envilder@0.4.0
#:package Microsoft.Extensions.Hosting.Abstractions@*
#:property PublishAot=false

using Envilder;
using Microsoft.Extensions.Hosting;

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? Environments.Production;

var secrets = await Env.LoadAsync(env, new Dictionary<string, string?>
{
    [Environments.Development] = "../../../envilder.json",
    [Environments.Staging] = "../../../envilder.json",
    [Environments.Production] = "../../../envilder.json",
    ["test"] = null,  // no secrets loaded
});

foreach (var key in secrets.Keys)
    Console.WriteLine($"{key} = {Environment.GetEnvironmentVariable(key)}");
