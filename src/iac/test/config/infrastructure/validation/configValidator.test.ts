import type { IDeploymentRequest } from '../../../../src/config/application/deployInfrastructure/models/deploymentRequest';
import { AppEnvironment } from '../../../../src/config/domain/model/appEnvironment';
import { ConfigValidator } from '../../../../src/config/domain/validation/configValidator';
import { ConfigValidationError } from '../../../../src/config/infrastructure/utilities/errors';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  function createValidConfig(): IDeploymentRequest {
    return {
      repoName: 'test-repo',
      vpcId: 'vpc-12345678',
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
        shared: {
          pipeline: [],
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

  test('Should_PassValidation_When_ValidConfigWithFrontendStacks', () => {
    // Arrange
    const config = createValidConfig();
    config.stacks.frontend.staticWebsites = [
      { name: 'web-app', projectPath: './src/web', subdomain: 'www' },
    ];

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

  test('Should_ThrowConfigValidationError_When_VpcIdMissing', () => {
    // Arrange
    const config = createValidConfig();
    config.vpcId = '';

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'vpcId is required and cannot be empty',
        ]),
      }),
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

  test('Should_ThrowConfigValidationError_When_DomainNameMissing', () => {
    // Arrange
    const config = createValidConfig();
    config.domain.name = '';

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'domain.name is required and cannot be empty',
        ]),
      }),
    );
  });

  test('Should_ThrowConfigValidationError_When_DomainCertificateIdMissing', () => {
    // Arrange
    const config = createValidConfig();
    config.domain.certificateId = '';

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'domain.certificateId is required and cannot be empty',
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

  test('Should_ThrowConfigValidationError_When_FrontendConfigMissing', () => {
    // Arrange
    const config = createValidConfig();
    // biome-ignore lint/suspicious/noExplicitAny: testing null config
    config.stacks.frontend = null as any;

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'stacks.frontend is required',
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

  test('Should_ThrowConfigValidationError_When_StaticWebsiteSubdomainMissing', () => {
    // Arrange
    const config = createValidConfig();
    config.stacks.frontend.staticWebsites = [
      { name: 'web', projectPath: './src/web', subdomain: '' },
    ];

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'frontend.staticWebsites[0].subdomain is required',
        ]),
      }),
    );
  });

  test('Should_ThrowConfigValidationError_When_MultipleErrorsExist', () => {
    // Arrange
    const config = createValidConfig();
    config.repoName = '';
    config.vpcId = '';
    config.branch = '';
    config.domain.name = '';

    // Act
    const act = () => validator.validate(config);

    // Assert
    expect(act).toThrow(ConfigValidationError);
    expect(act).toThrow('Configuration validation failed with 4 error(s)');
    expect(act).toThrow(
      expect.objectContaining({
        validationErrors: expect.arrayContaining([
          'repoName is required and cannot be empty',
          'vpcId is required and cannot be empty',
          'branch is required and cannot be empty',
          'domain.name is required and cannot be empty',
        ]),
      }),
    );
  });
});
