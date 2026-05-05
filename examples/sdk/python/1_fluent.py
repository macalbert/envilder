# /// script
# dependencies = ["envilder>=0.4.0"]
# ///

# Fluent builder: override provider, profile, or vault URL
from envilder import Envilder, SecretProviderType

secrets = (
    Envilder.from_map_file("../../../envilder.json")
    .with_provider(SecretProviderType.AWS)
    .with_profile("mac")
    .resolve()
)

for key, value in secrets.items():
    print(f"{key} = {value}")
