// Resolve secrets from a map file and print them
#:package Envilder@0.2.*
#:property PublishAot=false

using Envilder.Application;

var secrets = Envilder.ResolveFile("../../../secrets-map.json");

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
