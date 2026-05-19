// Fluent builder: override provider, profile, or vault URL
#:package Envilder@0.4.0
#:property PublishAot=false

using Envilder;

var secrets = await Env.FromMapFile("../../../envilder.json")
    .WithProfile("mac")
    .ResolveAsync();

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
