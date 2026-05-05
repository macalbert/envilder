// Environment-based routing: pick a different map file per environment
import { Envilder } from '@envilder/sdk';

const env = process.env.APP_ENV ?? 'production';

const secrets = await Envilder.load(env, {
  development: '../../../envilder.json',
  staging: '../../../envilder.json',
  production: '../../../envilder.json',
  test: null, // no secrets loaded
});

for (const [key, value] of secrets) {
  console.log(`${key} = ${value}`);
}
