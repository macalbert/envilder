# Envilder Python SDK — Examples

Minimal examples showing how to load secrets from AWS SSM Parameter Store using the Python SDK.

Uses [PEP 723](https://peps.python.org/pep-0723/) inline script metadata
— no setup required.

## Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/)
- AWS credentials configured (`~/.aws/credentials`, env vars, or IAM role)
- SSM parameters matching the paths in [`secrets-map.json`](../../../secrets-map.json)

## Run

All commands from the **`examples/sdk/python/`** directory:

| Example            | Description                    | Command                |
|--------------------|--------------------------------|------------------------|
| `1_load.py`        | Load + inject into `os.environ`| `uv run 1_load.py`    |
| `2_resolve.py`     | Resolve without injecting      | `uv run 2_resolve.py` |
| `3_fluent.py`      | Fluent builder with overrides  | `uv run 3_fluent.py`  |
| `4_env_routing.py` | Pick map file by environment   | `uv run 4_env_routing.py` |

```bash
cd examples/sdk/python
uv run 1_load.py
```
