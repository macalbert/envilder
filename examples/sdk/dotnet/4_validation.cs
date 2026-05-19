// Secret validation: fail fast if any secret is missing or empty
#:package Envilder@0.4.0
#:property PublishAot=false

using Envilder;

var secrets = await Env.ResolveFileAsync("../../../envilder.json");
secrets.ValidateSecrets(); // throws SecretValidationException if any value is empty

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");
