# /// script
# dependencies = ["envilder>=0.4.0"]
# ///

# Environment-based routing: pick a different map file per environment
import os

from envilder import Envilder

env = os.environ.get("APP_ENV", "production")

secrets = Envilder.load(env, {
    "development": "../../../envilder.json",
    "staging": "../../../envilder.json",
    "production": "../../../envilder.json",
    "test": None,  # no secrets loaded
})

for key in secrets:
    print(f"{key} = {os.environ.get(key)}")
