// Resolve secrets from a map file and print them
#:package Envilder@0.*
#:property PublishAot=false

using Envilder.Application;
using Envilder.Infrastructure;

var mapFile = new MapFileParser().Parse(File.ReadAllText("../../../secrets-map.json"));
var provider = SecretProviderFactory.Create(mapFile.Config);
var secrets = await new EnvilderClient(provider).ResolveSecretsAsync(mapFile);

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
