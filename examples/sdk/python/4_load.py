# /// script
# dependencies = ["envilder>=0.3.1"]
# ///

# The simplest way: one line to load secrets into os.environ
from envilder import Envilder

secrets = Envilder.load("../../../secrets-map.json")

print(secrets)
