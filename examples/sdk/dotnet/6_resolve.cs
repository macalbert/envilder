// Resolve secrets without injecting into environment variables
#:package Envilder@0.4.0
#:property PublishAot=false

using Envilder;

var secrets = await Envilder.ResolveFileAsync("../../../envilder.json");

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
