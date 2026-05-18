// Resolve secrets without injecting into environment variables
#:package Envilder@0.3.0
#:property PublishAot=false

using static Envilder.Envilder;

var secrets = await ResolveFileAsync("../../../envilder.json");

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
