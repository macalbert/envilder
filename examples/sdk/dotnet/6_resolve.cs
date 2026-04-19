// Resolve secrets without injecting into environment variables
#:package Envilder@*
#:property PublishAot=false

using static Envilder.Application.Envilder;

var secrets = await ResolveFileAsync("../../../secrets-map.json");

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
