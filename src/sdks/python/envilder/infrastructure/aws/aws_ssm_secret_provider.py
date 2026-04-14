from __future__ import annotations

from typing import TYPE_CHECKING

from botocore.exceptions import ClientError

from envilder.domain.ports import ISecretProvider

if TYPE_CHECKING:
    from mypy_boto3_ssm import SSMClient


class AwsSsmSecretProvider(ISecretProvider):
    def __init__(self, ssm_client: SSMClient) -> None:
        if ssm_client is None:
            raise ValueError("ssm_client cannot be None")
        self._ssm_client = ssm_client

    def get_secret(self, name: str) -> str | None:
        if not name or not name.strip():
            raise ValueError("Secret name cannot be null or whitespace.")

        try:
            response = self._ssm_client.get_parameter(
                Name=name, WithDecryption=True
            )
            param = response.get("Parameter")
            value = param.get("Value") if param else None
            return str(value) if value is not None else None
        except ClientError as e:
            error = e.response.get("Error", {})
            if error.get("Code")not None else None
        except ClientError as e:
            error = e.response.get("Error", {})
            if error.get("Code") == "ParameterNotFound":
                return None
            raise
