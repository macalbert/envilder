// Use Envilder as an IConfiguration source
#:package AWSSDK.SimpleSystemsManagement@4.*
#:package Microsoft.Extensions.Configuration@10.*
#:package Envilder@0.*
#:property PublishAot=false

using Envilder.Application;
using Envilder.Infrastructure;
using Envilder.Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;

var mapFile = new MapFileParser().Parse(File.ReadAllText("../../../secrets-map.json"));
var provider = SecretProviderFactory.Create(mapFile.Config);

var config = new ConfigurationBuilder()
    .AddEnvilder("../../../secrets-map.json", provider)
    .Build();

foreach (var key in mapFile.Mappings.Keys)
    Console.WriteLine($"{key} = {config[key]}");
