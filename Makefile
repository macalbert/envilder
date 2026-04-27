# =============================================================================
# Envilder SDK — Makefile
# =============================================================================
# Targets follow the pattern: <action>-sdk-<stack>
#   check  → format/lint/type verification (no changes)
#   format → auto-fix formatting
#   build  → compile (stacks that need it)
#   test   → run all tests
# =============================================================================

.DEFAULT_GOAL := help

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DOTNET_SRC  := src/sdks/dotnet
DOTNET_TEST := tests/sdks/dotnet

PYTHON_SRC  := src/sdks/python
PYTHON_TEST := tests/sdks/python

NODEJS_SRC  := src/sdks/nodejs
NODEJS_TEST := tests/sdks/nodejs

# ---------------------------------------------------------------------------
# .NET SDK
# ---------------------------------------------------------------------------
.PHONY: check-sdk-dotnet format-sdk-dotnet build-sdk-dotnet test-sdk-dotnet

check-sdk-dotnet: ## Verify .NET formatting (no changes)
	dotnet format $(DOTNET_SRC)/Envilder.sln --verify-no-changes --verbosity normal

format-sdk-dotnet: ## Auto-format .NET code
	dotnet format $(DOTNET_SRC)/Envilder.sln

build-sdk-dotnet: ## Build .NET SDK
	dotnet build $(DOTNET_SRC)/Envilder.sln -c Release

test-sdk-dotnet: build-sdk-dotnet ## Run all .NET tests
	dotnet test $(DOTNET_SRC)/Envilder.sln --no-build -c Release \
		--logger:"console;verbosity=detailed"

# ---------------------------------------------------------------------------
# Python SDK
# ---------------------------------------------------------------------------
.PHONY: install-sdk-python check-sdk-python format-sdk-python test-sdk-python

install-sdk-python: ## Install Python SDK in project-local venv
	cd $(PYTHON_SRC) && uv sync --all-extras

check-sdk-python: ## Verify Python formatting + types (no changes)
	uv run --project $(PYTHON_SRC) black --check $(PYTHON_SRC)/envilder/
	uv run --project $(PYTHON_SRC) isort --check-only $(PYTHON_SRC)/envilder/
	uv run --project $(PYTHON_SRC) mypy $(PYTHON_SRC)/envilder/
	uv run --project $(PYTHON_SRC) black --check $(PYTHON_TEST)/
	uv run --project $(PYTHON_SRC) isort --check-only $(PYTHON_TEST)/

format-sdk-python: ## Auto-format Python code (black + isort)
	uv run --project $(PYTHON_SRC) black $(PYTHON_SRC)/envilder/
	uv run --project $(PYTHON_SRC) black $(PYTHON_TEST)/
	uv run --project $(PYTHON_SRC) isort $(PYTHON_SRC)/envilder/
	uv run --project $(PYTHON_SRC) isort $(PYTHON_TEST)/

test-sdk-python: ## Run all Python tests
	uv run --project $(PYTHON_SRC) pytest $(PYTHON_TEST)/ -v --junitxml=$(PYTHON_TEST)/test-results.xml

# ---------------------------------------------------------------------------
# Node.js SDK
# ---------------------------------------------------------------------------
.PHONY: check-sdk-nodejs format-sdk-nodejs build-sdk-nodejs test-sdk-nodejs

check-sdk-nodejs: ## Verify Node.js SDK formatting (no changes)
	cd $(NODEJS_SRC) && pnpm exec biome check

format-sdk-nodejs: ## Auto-format Node.js SDK code
	cd $(NODEJS_SRC) && pnpm exec biome check --write --unsafe && pnpm exec biome format --write

build-sdk-nodejs: ## Build Node.js SDK
	cd $(NODEJS_SRC) && pnpm build

test-sdk-nodejs: build-sdk-nodejs ## Run Node.js SDK unit tests
	cd $(NODEJS_TEST) && pnpm vitest run --reporter=verbose --exclude="**/acceptance/**"

# ---------------------------------------------------------------------------
# All SDKs
# ---------------------------------------------------------------------------
.PHONY: check-sdk format-sdk build-sdk test-sdk

check-sdk: check-sdk-dotnet check-sdk-python check-sdk-nodejs ## Verify all SDKs
format-sdk: format-sdk-dotnet format-sdk-python format-sdk-nodejs ## Format all SDKs
build-sdk: build-sdk-dotnet build-sdk-nodejs ## Build all SDKs
test-sdk: test-sdk-dotnet test-sdk-python test-sdk-nodejs ## Test all SDKs

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
.PHONY: help
help: ## Show this help
	@echo Available targets:
	@echo   .NET SDK
	@echo     check-sdk-dotnet            Verify .NET formatting
	@echo     format-sdk-dotnet           Auto-format .NET code
	@echo     build-sdk-dotnet            Build .NET SDK
	@echo     test-sdk-dotnet             Run .NET unit tests
	@echo   Python SDK
	@echo     install-sdk-python          Install Python SDK (editable + dev)
	@echo     check-sdk-python            Verify Python formatting + types
	@echo     format-sdk-python           Auto-format Python code
	@echo     test-sdk-python             Run all Python tests
	@echo   Node.js SDK
	@echo     check-sdk-nodejs            Verify Node.js SDK formatting
	@echo     format-sdk-nodejs           Auto-format Node.js SDK code
	@echo     build-sdk-nodejs            Build Node.js SDK
	@echo     test-sdk-nodejs             Run Node.js SDK unit tests
	@echo   All SDKs
	@echo     check-sdk                   Verify all SDKs
	@echo     format-sdk                  Format all SDKs
	@echo     build-sdk                   Build all SDKs (.NET only)
	@echo     test-sdk                    Test all SDKs
