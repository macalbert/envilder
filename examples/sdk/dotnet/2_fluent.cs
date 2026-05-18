// Fluent builder: override provider, profile, or vault URL
#:package Envilder@0.3.0
#:property PublishAot=false

using static Envilder.Envilder;

var secrets = await FromMapFile("../../../envilder.json")
    .WithProfile("mac")
    .ResolveAsync();

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
