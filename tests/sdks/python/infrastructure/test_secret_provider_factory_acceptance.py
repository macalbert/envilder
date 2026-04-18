from __future__ import annotations

import pytest
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.secret_provider_type import SecretProviderType
from envilder.infrastructure.secret_provider_factory import (
    _SecretProviderFactory,
)

pytestmark = pytest.mark.acceptance


class TestSecretProviderFactoryAcceptance:
    def Should_ResolveSecret_When_FactoryCreatesProviderWithoutProfile(
        self,
        ssm_client,
        aws_env_for_factory,
    ) -> None:
        # Arrange
        ssm_client.put_parameter(
            Name="/Test/FactoryNoProfile",
            Value="factory-no-profile-secret",
            Type="SecureString",
            Overwrite=True,
        )
        config = MapFileConfig(provider=SecretProviderType.AWS)
        sut = _SecretProviderFactory.create(config)

        # Act
        actual = sut.get_secret("/Test/FactoryNoProfile")

        # Assert
        assert actual == "factory-no-profile-secret"

    def Should_ResolveSecret_When_FactoryCreatesProviderWithProfile(
        self,
        ssm_client,
        aws_env_with_profile_for_factory,
    ) -> None:
        # Arrange
        ssm_client.put_parameter(
            Name="/Test/FactoryWithProfile",
            Value="factory-profile-secret",
            Type="SecureString",
            Overwrite=True,
        )
        config = MapFileConfig(
            provider=SecretProviderType.AWS,
            profile="localstack-test",
        )
        sut = _SecretProviderFactory.create(config)

        # Act
        actual = sut.get_secret("/Test/FactoryWithProfile")

        # Assert
        assert actual == "factory-profile-secret"
