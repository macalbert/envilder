# Python Testing — Real Examples

Examples extracted from the codebase to illustrate patterns described in SKILL.md.

## Project Structure

```txt
xxtemplatexx/test/apps/ai-process-lambda/
├── conftest.py
├── test_builder.py
├── acceptance/
│   └── test_lambda_handler.py
└── unit/
    ├── domain/
    │   ├── models/
    │   │   └── data_verification_builder.py
    │   └── services/
    │       ├── data_extraction/
    │       │   ├── test_service.py
    │       │   └── test_confidence_calculator.py
    │       └── document_verification/
    │           └── test_document_verification_service.py
    └── infrastructure/
        ├── llm/
        │   └── test_openai_llm_client.py
        ├── pdf_converter/
        │   └── test_pdf2image_converter.py
        └── config/
            ├── settings/
            │   └── test_pydantic_settings_loader.py
            └── logger/
                └── test_json_formatter.py
```

## Unit Tests with Fixtures and Builder Pattern

```python
# test_document_verification_service.py

@pytest.fixture
def llm_client() -> Mock:
    return Mock()

@pytest.fixture
def pdf_converter() -> Pdf2ImageConverter:
    return Pdf2ImageConverter()

@pytest.fixture
def logger() -> Mock:
    return Mock(spec=logging.Logger)

@pytest.fixture
def sut(
    llm_client: Mock, pdf_converter: Pdf2ImageConverter, logger: Mock
) -> DocumentVerificationService:
    return DocumentVerificationService(
        llm_client=llm_client,
        pdf_converter=pdf_converter,
        logger=logger,
    )


@pytest.mark.unit
class TestVerify:
    async def Should_ReturnInvoiceType_When_LLMClassifiesAsInvoice(
        self,
        llm_client: Mock,
        sut: DocumentVerificationService,
    ) -> None:
        # Arrange
        llm_response = (
            DocumentVerificationResponseBuilder()
            .with_document_type(DocumentType.INVOICE)
            .with_confidence(0.95)
            .with_reasoning("Document contains itemized veterinary services and costs")
            .build()
        )
        llm_client.parse = AsyncMock(return_value=llm_response)

        # Act
        result = await sut.verify(
            document_data=b"fake_image_bytes",
            document_id="doc-123",
        )

        # Assert
        assert result.document_id == "doc-123"
        assert result.document_type == DocumentType.INVOICE
        assert result.confidence == 0.95
        llm_client.parse.assert_called_once()
```

## Simple Unit Tests (No Fixtures)

```python
# test_openai_llm_client.py

class TestOpenAILLMClient:
    @pytest.mark.unit
    def Should_DetectPngMediaType_When_DataIsPng(self) -> None:
        # Arrange
        png_data = b"\x89PNG\r\n\x1a\n" + b"fake png content"
        config = LLMConfig(api_key="test-key", model="gpt-4")
        mock_logger = Mock()
        sut = OpenAILLMClient(config, mock_logger)

        # Act
        actual = sut._detect_media_type(png_data)

        # Assert
        expected = "image/png"
        assert actual == expected

    @pytest.mark.unit
    def Should_DetectJpegMediaType_When_DataIsJpeg(self) -> None:
        # Arrange
        jpeg_data = b"\xff\xd8" + b"fake jpeg content"
        config = LLMConfig(api_key="test-key", model="gpt-4")
        mock_logger = Mock()
        sut = OpenAILLMClient(config, mock_logger)

        # Act
        actual = sut._detect_media_type(jpeg_data)

        # Assert
        expected = "image/jpeg"
        assert actual == expected
```

## Builder Pattern with Fluent API

```python
# test_builder.py

class TestBuilderPattern:
    @pytest.mark.unit
    def Should_CreateInstance_When_UsingFluentBuilder(self) -> None:
        # Act
        client = (
            ClientVerificationBuilder()
            .with_extracted_name("Leeroy Jenkins")
            .with_expected_name("PALS FOR LIFE")
            .with_confidence(0.99)
            .build()
        )

        # Assert
        assert client.extracted_name == "Leeroy Jenkins"
        assert client.expected_name == "PALS FOR LIFE"
        assert client.confidence == 0.99
```

## Shared Generic Builder (polyfactory)

```python
# shared/test/python/shared/factories/builder.py

class Builder(Generic[T]):
    _factory: type[BaseFactory[T]] | None = None
    _overrides: dict[str, Any]

    def __init__(self) -> None:
        self._overrides = {}

    def build(self) -> T:
        if self._factory is None:
            raise AttributeError(
                f"'{type(self).__name__}' has no factory configured."
            )
        return self._factory.build(**self._overrides)

    def build_batch(self, size: int) -> list[T]:
        return [self.build() for _ in range(size)]

    def __getattr__(self, name: str) -> Any:
        if name.startswith("with_"):
            field_name = name[5:]

            def setter(value: Any) -> Builder[T]:
                self._overrides[field_name] = value
                return self

            return setter
        raise AttributeError(f"'{type(self).__name__}' has no attribute '{name}'")
```

## Acceptance Tests with Containers

```python
# test_lambda_handler.py

@pytest.mark.acceptance
class TestLambdaAcceptance:

    def Should_StartSuccessfully_When_DotEnvFileContainsAllRequiredVariables(
        self,
        lambda_container: LambdaContainer,
    ) -> None:
        # Act
        sut = lambda_container

        # Assert
        actual = sut.read_env()
        assert actual.get("OPENAI_API_KEY"), "OPENAI_API_KEY cannot be empty"

    def Should_ProcessClaimAndReturnValidResponse_When_LambdaInvoked(
        self, lambda_container: LambdaContainer, wiremock_container: WireMockContainer
    ) -> None:
        # Arrange
        setup_openai_document_verification_mock(wiremock_container)
        setup_openai_products_extraction_mock(wiremock_container)
        setup_azure_document_intelligence_analyze_mock(wiremock_container)
        setup_http_document_mock(wiremock_container)

        test_request = {
            "claimId": "87654321-4321-4321-4321-cba987654321",
            "claimType": "VetService",
            "documents": [
                {
                    "documentId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
                    "s3Url": f"{wiremock_container.get_internal_url()}/documents/invoice.pdf",
                },
            ],
        }

        # Act
        response = lambda_container.invoke(test_request)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["claimId"] == test_request["claimId"]
        assert "documentVerification" in response_data
```

## Multiple Builders in Same Test (side_effect)

```python
async def Should_ReturnIsCompleteTrue_When_AllRequiredDocumentsPresent(
    self,
    llm_client: Mock,
    sut: DocumentVerificationService,
) -> None:
    # Arrange
    llm_client.parse = AsyncMock(
        side_effect=[
            DocumentVerificationResponseBuilder()
            .with_document_type(DocumentType.INVOICE)
            .with_confidence(0.95)
            .with_reasoning("Invoice detected")
            .build(),
            DocumentVerificationResponseBuilder()
            .with_document_type(DocumentType.MEDICAL_REPORT)
            .with_confidence(0.90)
            .with_reasoning("Medical report detected")
            .build(),
        ]
    )

    documents = [
        DownloadedDocumentBuilder().with_content(b"fake_image_bytes").build(),
        DownloadedDocumentBuilder().with_content(b"fake_image_bytes").build(),
    ]

    # Act
    result = await sut.verify_claim(documents=documents, claim_type="VetService")

    # Assert
    assert result.is_complete is True
    assert len(result.missing_documents) == 0
    assert len(result.verifications) == 2
```
