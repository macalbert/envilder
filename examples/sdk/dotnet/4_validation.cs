// Validation: two checks that answer different questions
//   ValidateContractAsync(): before loading, is the map file valid and does every
//     declared secret exist? Never uses or prints a value (same check as `envilder validate`)
//   ValidateSecrets(): after resolving, is every resolved value non-empty?
#:package Envilder@1.1.0
#:property PublishAot=false

using Envilder;

const string mapFile = "../../../envilder.json";

// 1. Contract check: expected failures are returned in the result, not thrown
var result = await Env.FromMapFile(mapFile).ValidateContractAsync();
if (!result.IsValid)
{
    foreach (var error in result.MapFileErrors)
        Console.Error.WriteLine($"{error.Key}: {error.Message}");

    foreach (var key in result.Keys.Where(k => k.Status != SecretExistenceStatus.Exists))
        Console.Error.WriteLine($"{key.Variable} ({key.Path}): {key.Status} {key.Reason}".TrimEnd());

    return 1;
}

// 2. Or fail the load itself: the contract check runs once before resolving
//    and throws ContractValidationException naming the failing keys
var secrets = await Env.FromMapFile(mapFile)
    .WithContractValidation()
    .ResolveAsync();

// 3. Value check: throws SecretValidationException if any value is empty
secrets.ValidateSecrets();

foreach (var (key, value) in secrets)
    Console.WriteLine($"{key} = {value}");

return 0;
