"""Secret validation utilities for resolved secret dictionaries."""

from typing import Dict, List


class SecretValidationError(Exception):
    """Raised when one or more resolved secrets are missing or empty.

    Attributes:
        missing_keys: Keys whose values were None, empty, or whitespace.
            Empty list when the entire dictionary was empty.

    Example::

        from envilder import Envilder
        from envilder.application.secret_validation import validate_secrets

        secrets = Envilder.resolve_file("param-map.json")
        validate_secrets(secrets)  # raises SecretValidationError if any value is empty
    """

    def __init__(self, missing_keys: List[str]) -> None:
        self.missing_keys = missing_keys
        super().__init__(self._build_message(missing_keys))

    @staticmethod
    def _build_message(missing_keys: List[str]) -> str:
        if not missing_keys:
            return "No secrets were resolved."
        return (
            "The following secrets have empty or missing values: "
            + ", ".join(missing_keys)
        )


def validate_secrets(secrets: Dict[str, str]) -> None:
    """Validate that all resolved secrets have non-empty values.

    Raises:
        TypeError: When ``secrets`` is None.
        SecretValidationError: When the dictionary is empty or any
            value is None, empty, or whitespace-only.

    Example::

        from envilder.application.secret_validation import validate_secrets

        secrets = {"DB_URL": "postgres://localhost", "API_KEY": "sk-123"}
        validate_secrets(secrets)  # passes silently

        secrets = {"DB_URL": "", "API_KEY": "sk-123"}
        validate_secrets(secrets)  # raises SecretValidationError
    """
    if secrets is None:
        raise TypeError("secrets cannot be None")

    if not secrets:
        raise SecretValidationError([])

    missing_keys = [
        key
        for key, value in secrets.items()
        if value is None or not value.strip()
    ]

    if missing_keys:
        raise SecretValidationError(missing_keys)
