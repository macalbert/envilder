from enum import Enum


class SecretProviderType(str, Enum):
    AWS = "aws"
    AZURE = "azure"
