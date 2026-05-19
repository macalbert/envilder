// Use Envilder as an IConfiguration source
#:package Microsoft.Extensions.Configuration@10.*
#:package Envilder@0.4.0
#:property PublishAot=false

using Envilder;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .AddEnvilder("../../../envilder.json")
    .Build();

var mapFile = new MapFileParser().Parse(File.ReadAllText("../../../envilder.json"));

foreach (var key in mapFile.Mappings.Keys)
    Console.WriteLine($"{key} = {config[key]}");
