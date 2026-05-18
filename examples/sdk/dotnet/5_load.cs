// One-liner: resolve secrets and inject into environment variables
#:package Envilder@0.3.0
#:property PublishAot=false

using static Envilder.Envilder;

var secrets = await LoadAsync("../../../envilder.json");

foreach (var key in secrets.Keys)
    Console.WriteLine($"{key} = {Environment.GetEnvironmentVariable(key)}");
