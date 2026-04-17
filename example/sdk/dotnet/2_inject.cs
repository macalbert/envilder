// Resolve secrets and inject them into environment variables
#:package Envilder@0.*
#:property PublishAot=false

using Envilder.Application;
using Envilder.Infrastructure;

var mapFile = new MapFileParser().Parse(File.ReadAllText("../../../secrets-map.json"));
var provider = SecretProviderFactory.Create(mapFile.Config);
var secrets = await new EnvilderClient(provider).ResolveSecretsAsync(mapFile);

EnvilderClient.InjectIntoEnvironment(secrets);

foreach (var key in secrets.Keys)
    Console.WriteLine($"{key} = {Environment.GetEnvironmentVariable(key)}");
