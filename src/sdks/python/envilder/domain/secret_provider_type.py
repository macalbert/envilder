from enum import Enum


class SecretProviderType(str, Enum):
    """Supported secret provider backends."""

    AWS = "aws"
    AZURE = "azure"
