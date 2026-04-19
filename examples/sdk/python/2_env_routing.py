# /// script
# dependencies = ["envilder>=0.3.1"]
# ///

# Environment-based routing: pick a different map file per environment
import os

from envilder import Envilder

env = os.environ.get("APP_ENV", "production")

secrets = Envilder.load(env, {
    "development": "../../../secrets-map.json",
    "staging": "../../../secrets-map.json",
    "production": "../../../secrets-map.json",
    "test": None,  # no secrets loaded
})

for key in secrets:
    print(f"{key} = {os.environ.get(key)}")
