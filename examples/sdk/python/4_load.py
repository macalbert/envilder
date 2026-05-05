# /// script
# dependencies = ["envilder>=0.4.0"]
# ///

# The simplest way: one line to load secrets into os.environ
from envilder import Envilder

secrets = Envilder.load("../../../envilder.json")

print(secrets)
