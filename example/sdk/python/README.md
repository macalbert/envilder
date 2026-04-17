# Envilder Python SDK — Examples

Minimal examples showing how to load secrets from AWS SSM Parameter Store using the Python SDK.

## Prerequisites

- Python 3.10+
- AWS credentials configured (`~/.aws/credentials`, env vars, or IAM role)
- SSM parameters matching the paths in [`secrets-map.json`](../../../secrets-map.json)

## Setup

```bash
pip install -r requirements.txt
```

## Run

| Example | Description | Command |
|---|---|---|
| `1_load.py` | Load + inject into `os.environ` | `python 1_load.py` |
| `2_resolve.py` | Resolve without injecting | `python 2_resolve.py` |
| `3_fluent.py` | Fluent builder with overrides | `python 3_fluent.py` |
| `4_env_routing.py` | Pick map file by environment | `python 4_env_routing.py` |
