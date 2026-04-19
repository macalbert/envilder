// Fluent builder: override provider, profile, or vault URL
#:package Envilder@*
#:property PublishAot=false

using static Envilder.Application.Envilder;

var secrets = await FromMapFile("../../../secrets-map.json")
    .WithProfile("mac")
    .ResolveAsync();

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
