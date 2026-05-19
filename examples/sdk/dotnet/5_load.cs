// One-liner: resolve secrets and inject into environment variables
#:package Envilder@0.4.0
#:property PublishAot=false

using Envilder;

var secrets = await Env.LoadAsync("../../../envilder.json");

foreach (var key in secrets.Keys)
    Console.WriteLine($"{key} = {Environment.GetEnvironmentVariable(key)}");
