// Use Envilder as an IConfiguration source
#:package Microsoft.Extensions.Configuration@10.*
#:package Envilder@0.2.*
#:property PublishAot=false

using Envilder.Application;
using Envilder.Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .AddEnvilder("../../../secrets-map.json")
    .Build();

var mapFile = new MapFileParser().Parse(File.ReadAllText("../../../secrets-map.json"));

foreach (var key in mapFile.Mappings.Keys)
    Console.WriteLine($"{key} = {config[key]}");
