# Environment-based routing: pick a different map file per environment
from envilder import Envilder

env = "production"

secrets = Envilder.load(env, {
    "production": "../../../secrets-map.json",
    "development": "../../../secrets-map.json",
    "test": None,
})

print(secrets)
