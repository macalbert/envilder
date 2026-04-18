// Resolve secrets and inject them into environment variables
#:package Envilder@0.*
#:property PublishAot=false

using Envilder.Application;

var secrets = Envilder.Load("../../../secrets-map.json");

foreach (var key in secrets.Keys)
    Console.WriteLine($"{key} = {Environment.GetEnvironmentVariable(key)}");
