# /// script
# dependencies = ["envilder>=0.3.1"]
# ///

# Fluent builder: override provider, profile, or vault URL
from envilder import Envilder, SecretProviderType

secrets = (
    Envilder.from_map_file("../../../secrets-map.json")
    .with_provider(SecretProviderType.AWS)
    .with_profile("mac")
    .resolve()
)

for key, value in secrets.items():
    print(f"{key} = {value}")
