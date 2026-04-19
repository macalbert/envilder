// One-liner: resolve secrets and inject into environment variables
#:package Envilder@*
#:property PublishAot=false

using static Envilder.Application.Envilder;

var secrets = await LoadAsync("../../../secrets-map.json");

foreach (var key in secrets.Keys)
    Console.WriteLine($"{key} = {Environment.GetEnvironmentVariable(key)}");
