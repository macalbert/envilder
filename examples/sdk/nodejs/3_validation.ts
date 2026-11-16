// Validation: two checks that answer different questions
//   validateContract(): before loading, is the map file valid and does every
//     declared secret exist? Never uses or prints a value (same check as `envilder validate`)
//   validateSecrets(): after resolving, is every resolved value non-empty?
import { Envilder, validateSecrets } from '@envilder/sdk';

const mapFile = '../../../envilder.json';

// 1. Contract check: expected failures are returned in the result, not thrown
const result = await Envilder.fromMapFile(mapFile).validateContract();
if (!result.isValid) {
  for (const error of result.mapFileErrors) {
    console.error(`${error.key}: ${error.message}`);
  }
  for (const key of result.keys.filter((k) => k.status !== 'exists')) {
    console.error(
      `${key.variable} (${key.path}): ${key.status} ${key.reason ?? ''}`.trimEnd(),
    );
  }
  process.exit(1);
}

// 2. Or fail the load itself: the contract check runs once before resolving
//    and throws ContractValidationError naming the failing keys
const secrets = await Envilder.fromMapFile(mapFile)
  .withContractValidation()
  .resolve();

// 3. Value check: throws SecretValidationError if any value is empty
validateSecrets(secrets);

for (const [key, value] of secrets) {
  console.log(`${key} = ${value}`);
}
