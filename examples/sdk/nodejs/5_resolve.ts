// Resolve secrets without injecting into process.env
import { Envilder } from '@envilder/sdk';

const secrets = await Envilder.resolveFile('../../../secrets-map.json');

for (const [key, value] of secrets) {
  console.log(`${key} = ${value}`);
}
