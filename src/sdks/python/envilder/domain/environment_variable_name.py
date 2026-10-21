"""Which strings are usable as environment variable names.

Implements the map-file naming constraint in ADR-0008: an accepted name must
survive a ``.env`` round-trip as itself and nothing else.
``^[A-Za-z0-9_.-]+$`` is exactly the key grammar ``.env`` parsers recognize,
so anything outside it is either read back as a different assignment (``=``,
CR, LF, U+2028, U+2029) or silently lost (a space, ``#``, a tab, a non-Latin
letter).

``__proto__`` is inside the allowlist but every JavaScript reader that
accumulates pairs into a plain object drops it, so it is rejected as well to
keep the contract uniform across the CLI and every SDK.
"""

from __future__ import annotations

import json
import re

# ``fullmatch`` rather than ``match`` with ``$``: in Python ``$`` also matches
# before a trailing newline, which would accept ``"SAFE\n"``.
_READABLE_NAME = re.compile(r"[A-Za-z0-9_.-]+")

_UNSUPPORTED_NAMES = frozenset({"__proto__"})


def is_valid_environment_variable_name(name: str) -> bool:
    return (
        _READABLE_NAME.fullmatch(name) is not None
        and name not in _UNSUPPORTED_NAMES
    )


def invalid_environment_variable_name_message(name: str) -> str:
    """Build the rejection message.

    The name is untrusted input, so it is quoted rather than interpolated: a
    name carrying line terminators cannot break the message across lines.
    Only the name is echoed, never the mapped value.
    """
    if name.strip() == "":
        return "Environment variable name cannot be empty"

    if name in _UNSUPPORTED_NAMES:
        return (
            f"Unsupported environment variable name {_quote_name(name)}: "
            "a .env parser cannot read this name back, so it would be "
            "written but never resolved"
        )

    return (
        f"Invalid environment variable name {_quote_name(name)}: names may "
        "only contain letters, digits, underscore, dot and hyphen, so that "
        "they can be read back from a .env file"
    )


def _quote_name(name: str) -> str:
    # ``ensure_ascii`` escapes every non-ASCII character, U+2028/U+2029
    # included, and control characters are always escaped.
    return json.dumps(name, ensure_ascii=True)
