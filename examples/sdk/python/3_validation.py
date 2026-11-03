# /// script
# dependencies = ["envilder>=1.1.0"]
# ///

# Validation: two checks that answer different questions
#   validate_contract(): before loading, is the map file valid and does every
#     declared secret exist? Reads no value (the same check as `envilder validate`)
#   validate_secrets(): after resolving, is every resolved value non-empty?
import sys

from envilder import Envilder, SecretExistenceStatus, validate_secrets

MAP_FILE = "../../../envilder.json"

# 1. Contract check: expected failures are returned in the result, not raised
result = Envilder.from_map_file(MAP_FILE).validate_contract()
if not result.is_valid:
    for error in result.map_file_errors:
        print(f"{error.key}: {error.message}", file=sys.stderr)
    for key in result.keys:
        if key.status != SecretExistenceStatus.EXISTS:
            print(f"{key.variable} ({key.path}): {key.status.value}", file=sys.stderr)
    sys.exit(1)

# 2. Or fail the load itself: the contract check runs once before resolving
#    and raises ContractValidationError naming the failing keys
secrets = Envilder.from_map_file(MAP_FILE).with_contract_validation().resolve()

# 3. Value check: raises SecretValidationError if any value is empty
validate_secrets(secrets)

for key, value in secrets.items():
    print(f"{key} = {value}")
