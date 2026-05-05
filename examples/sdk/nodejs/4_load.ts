// The simplest way: one line to load secrets into process.env
import { Envilder } from '@envilder/sdk';

const secrets = await Envilder.load('../../../envilder.json');

console.log(secrets);
