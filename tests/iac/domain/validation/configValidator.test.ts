import { ConfigValidationError } from '../../../../src/iac/domain/errors';
import { AppEnvironment } from '../../../../src/iac/domain/model/appEnvironment';
import type { IDeploymentConfig } from '../../../../src/iac/domain/model/deploymentConfig';
import { ConfigValidator } from '../../../../src/iac/domain/validation/configValidator';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  function createValidConfig(): IDeploymentConfig {
    return {
      repoName: 'test-repo',
      branch: 'main',
      environment: AppEnvironment.Production,
      domain: {
        name: 'example.com',
        certificateId: 'cert-123456',
        hostedZoneId: 'Z123456789',
      },
      stacks: {
        frontend: {
          staticWebsites: [],
        },
      },
    };
  }

  test('Should_PassValidation_When_AllRequiredFieldsProvided', () => {
    // Arrange
    const config = createValidConfig();

    // Act & Assert
    expect(() => validator.validate(config)).not.toThrow();
  });

  test('Should_ThrowConfigValidationError_When_RepoNameMissing', () => {
    // Arrange
    const config = createValidConfig();
    config.repoName = '';

    // Act & Assert
    expect(() => validator.validate(config)).toThrow(ConfigValidationError);
    expect(() => validator.validate(config)).toThrow(
      'Configuration validation failed with 1 error(s)',
    );
  });

  test('Should_ThrowConfigValidationError_When_BranchMissing', () => {
    // Arrange
    const config = createValidConfig();
    config.branch = '   ';

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'branch is required and cannot be empty',
        ]),
      }),
    );
  });

  test('Should_ThrowConfigValidationError_When_DomainConfigMissing', () => {
    // Arrange
    const config = createValidConfig();
    // biome-ignore lint/suspicious/noExplicitAny: testing null config
    config.domain = null as any;

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'domain configuration is required',
        ]),
      }),
    );
  });

  test('Should_ThrowConfigValidationError_When_DomainHostedZoneIdMissing', () => {
    // Arrange
    const config = createValidConfig();
    config.domain.hostedZoneId = '';

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'domain.hostedZoneId is required and cannot be empty',
        ]),
      }),
    );
  });

  test('Should_ThrowConfigValidationError_When_StacksConfigMissing', () => {
    // Arrange
    const config = createValidConfig();
    // biome-ignore lint/suspicious/noExplicitAny: testing null config
    config.stacks = null as any;

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'stacks configuration is required',
        ]),
      }),
    );
  });

  test('Should_ThrowConfigValidationError_When_StaticWebsiteNameMissing', () => {
    // Arrange
    const config = createValidConfig();
    config.stacks.frontend.staticWebsites = [
      { name: '', projectPath: './src/web', subdomain: 'www' },
    ];

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'frontend.staticWebsites[0].name is required',
        ]),
      }),
    );
  });

  test('Should_PassValidation_When_StaticWebsiteHasNoSubdomain', () => {
    // Arrange
    const config = createValidConfig();
    config.stacks.frontend.staticWebsites = [
      { name: 'web', projectPath: './src/web' },
    ];

    // Act & Assert
    expect(() => validator.validate(config)).not.toThrow();
  });

  test('Should_ThrowConfigValidationError_When_MultipleErrorsExist', () => {
    // Arrange
    const config = createValidConfig();
    config.repoName = '';
    config.branch = '';
    config.domain.name = '';

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow('Configuration validation failed with 3 error(s)');
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'repoName is required and cannot be empty',
          'branch is required and cannot be empty',
          'domain.name is required and cannot be empty',
        ]),
      }),
    );
  });
});
