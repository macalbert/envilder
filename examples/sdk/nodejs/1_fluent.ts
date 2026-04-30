// Fluent builder: override provider, profile, or vault URL
import { Envilder, SecretProviderType } from '@envilder/sdk';

const secrets = await Envilder.fromMapFile('../../../secrets-map.json')
  .withProvider(SecretProviderType.Aws)
  .withProfile('mac')
  .resolve();

for (const [key, value] of secrets) {
  console.log(`${key} = ${value}`);
}
