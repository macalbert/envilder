# /// script
# dependencies = ["envilder>=0.3.1"]
# ///

# Secret validation: fail fast if any secret is missing or empty
from envilder import Envilder, validate_secrets

secrets = Envilder.resolve_file("../../../secrets-map.json")
validate_secrets(secrets)  # raises SecretValidationError if any value is empty

for key, value in secrets.items():
    print(f"{key} = {value}")
