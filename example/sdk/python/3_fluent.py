# Fluent builder: override provider, profile, or vault URL
from envilder import Envilder, SecretProviderType

secrets = (
    Envilder.from_file("../../../secrets-map.json")
    .with_provider(SecretProviderType.AWS)
    .with_profile("my-profile")
    .resolve()
)

for key, value in secrets.items():
    print(f"{key} = {value}")
