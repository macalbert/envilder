# Resolve secrets without injecting into os.environ
from envilder import Envilder

secrets = Envilder.resolve_file("../../../secrets-map.json")

for key, value in secrets.items():
    print(f"{key} = {value}")
