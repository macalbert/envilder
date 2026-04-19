from __future__ import annotations

from dataclasses import dataclass

from envilder.domain.map_file_config import MapFileConfig


@dataclass
class ParsedMapFile:
    """Result of parsing a JSON map file.

    Attributes:
        config: Provider configuration from the ``$config`` section.
        mappings: Environment variable name to secret path mappings.
    """

    config: MapFileConfig
    mappings: dict[str, str]
