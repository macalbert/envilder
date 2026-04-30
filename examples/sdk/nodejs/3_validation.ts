// Secret validation: fail fast if any secret is missing or empty
import { Envilder, validateSecrets } from '@envilder/sdk';

const secrets = await Envilder.resolveFile('../../../secrets-map.json');
validateSecrets(secrets); // throws SecretValidationError if any value is empty

for (const [key, value] of secrets) {
  console.log(`${key} = ${value}`);
}
