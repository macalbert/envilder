# =============================================================================
# Envilder SDK — Makefile
# =============================================================================
# Targets follow the pattern: <action>-sdk-<stack>
#   check  → format/lint verification (no changes)
#   format → auto-fix formatting
#   build  → compile / type-check
#   test   → unit tests only (no Docker)
#   test-acceptance → acceptance tests (requires Docker)
#   test-all → unit + acceptance
# =============================================================================

.DEFAULT_GOAL := help

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DOTNET_SRC  := src/sdks/dotnet
DOTNET_TEST := tests/sdks/dotnet

PYTHON_SRC  := src/sdks/python
PYTHON_TEST := tests/sdks/python

# ---------------------------------------------------------------------------
# .NET SDK
# ---------------------------------------------------------------------------
.PHONY: check-sdk-dotnet format-sdk-dotnet build-sdk-dotnet \
        test-sdk-dotnet test-acceptance-sdk-dotnet test-all-sdk-dotnet

check-sdk-dotnet: ## Verify .NET formatting (no changes)
	dotnet format $(DOTNET_SRC)/Envilder.sln --verify-no-changes --verbosity normal

format-sdk-dotnet: ## Auto-format .NET code
	dotnet format $(DOTNET_SRC)/Envilder.sln

build-sdk-dotnet: ## Build .NET SDK
	dotnet build $(DOTNET_SRC)/Envilder.sln -c Release

test-sdk-dotnet: build-sdk-dotnet ## Run .NET unit tests
	dotnet test $(DOTNET_SRC)/Envilder.sln --no-build -c Release \
		--logger:"console;verbosity=detailed"

test-acceptance-sdk-dotnet: build-sdk-dotnet ## Run .NET acceptance tests (Docker)
	dotnet test $(DOTNET_SRC)/Envilder.sln --no-build -c Release \
		--logger:"console;verbosity=detailed"

test-all-sdk-dotnet: test-sdk-dotnet ## Run all .NET tests

# ---------------------------------------------------------------------------
# Python SDK
# ---------------------------------------------------------------------------
.PHONY: install-sdk-python check-sdk-python format-sdk-python build-sdk-python \
        test-sdk-python test-acceptance-sdk-python test-all-sdk-python

install-sdk-python: ## Install Python SDK in editable mode with dev deps
	uv pip install --system -e "$(PYTHON_SRC)[dev]"

check-sdk-python: ## Verify Python formatting + types (no changes)
	cd $(PYTHON_SRC) && python -m black --check envilder/
	cd $(PYTHON_SRC) && python -m isort --check-only envilder/
	cd $(PYTHON_SRC) && python -m mypy envilder/
	cd $(PYTHON_TEST) && python -m black --check .
	cd $(PYTHON_TEST) && python -m isort --check-only .

format-sdk-python: ## Auto-format Python code (black + isort)
	cd $(PYTHON_SRC) && python -m black envilder/ && python -m isort envilder/
	cd $(PYTHON_TEST) && python -m black . && python -m isort .

build-sdk-python: ## Type-check Python SDK (mypy strict)
	cd $(PYTHON_SRC) && python -m mypy envilder/

test-sdk-python: ## Run Python unit tests (no Docker)
	cd $(PYTHON_TEST) && python -m pytest -m "not acceptance" -v

test-acceptance-sdk-python: ## Run Python acceptance tests (Docker)
	cd $(PYTHON_TEST) && python -m pytest -m "acceptance" -v

test-all-sdk-python: ## Run all Python tests
	cd $(PYTHON_TEST) && python -m pytest -v

# ---------------------------------------------------------------------------
# All SDKs
# ---------------------------------------------------------------------------
.PHONY: check-sdk format-sdk build-sdk test-sdk test-all-sdk

check-sdk: check-sdk-dotnet check-sdk-python ## Verify all SDKs
format-sdk: format-sdk-dotnet format-sdk-python ## Format all SDKs
build-sdk: build-sdk-dotnet build-sdk-python ## Build all SDKs
test-sdk: test-sdk-dotnet test-sdk-python ## Test all SDKs (unit only)
test-all-sdk: test-all-sdk-dotnet test-all-sdk-python ## Test all SDKs (all)

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
.PHONY: help
help: ## Show this help
	@echo "Available targets:"
	@echo ""
	@echo "  .NET SDK"
	@echo "    check-sdk-dotnet            Verify .NET formatting"
	@echo "    format-sdk-dotnet           Auto-format .NET code"
	@echo "    build-sdk-dotnet            Build .NET SDK"
	@echo "    test-sdk-dotnet             Run .NET unit tests"
	@echo "    test-acceptance-sdk-dotnet  Run .NET acceptance tests"
	@echo ""
	@echo "  Python SDK"
	@echo "    install-sdk-python          Install Python SDK (editable + dev)"
	@echo "    check-sdk-python            Verify Python formatting + types"
	@echo "    format-sdk-python           Auto-format Python code"
	@echo "    build-sdk-python            Type-check Python SDK (mypy)"
	@echo "    test-sdk-python             Run Python unit tests"
	@echo "    test-acceptance-sdk-python  Run Python acceptance tests"
	@echo "    test-all-sdk-python         Run all Python tests"
	@echo ""
	@echo "  All SDKs"
	@echo "    check-sdk                   Verify all SDKs"
	@echo "    format-sdk                  Format all SDKs"
	@echo "    build-sdk                   Build all SDKs"
	@echo "    test-sdk                    Test all SDKs (unit only)"
	@echo "    test-all-sdk                Test all SDKs (all)"
