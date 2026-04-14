from __future__ import annotations

from typing import Protocol


class ISecretProvider(Protocol):
    def get_secret(self, name: str) -> str | None: ...
