// Secret validation: fail fast if any secret is missing or empty
#:package Envilder@*
#:property PublishAot=false

using Envilder.Application;
using static Envilder.Application.Envilder;

var secrets = await ResolveFileAsync("../../../secrets-map.json");
secrets.ValidateSecrets(); // throws SecretValidationException if any value is empty

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
