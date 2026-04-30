// Environment-based routing: pick a different map file per environment
import { Envilder } from '@envilder/sdk';

const env = process.env.APP_ENV ?? 'production';

const secrets = await Envilder.load(env, {
  development: '../../../secrets-map.json',
  staging: '../../../secrets-map.json',
  production: '../../../secrets-map.json',
  test: null, // no secrets loaded
});

for (const [key, value] of secrets) {
  console.log(`${key} = ${value}`);
}
