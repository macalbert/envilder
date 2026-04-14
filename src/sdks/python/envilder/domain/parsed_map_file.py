from __future__ import annotations

from dataclasses import dataclass

from envilder.domain.map_file_config import MapFileConfig


@dataclass
class ParsedMapFile:
    config: MapFileConfig
    mappings: dict[str, str]
