import { describe, expect, it } from 'vitest';
import { DispatchActionCommand } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommand.js';
import type { CliOptions } from '../../../../../src/envilder/core/domain/CliOptions.js';
import { OperationMode } from '../../../../../src/envilder/core/domain/OperationMode.js';

describe('DispatchActionCommand', () => {
  it('Should_ReturnPushSingle_When_PushFlagAndAllSingleFieldsPresent', () => {
    // Arrange
    const options: CliOptions = {
      push: true,
      key: 'MY_KEY',
      value: 'secret',
      secretPath: '/path',
    };

    // Act
    const command = DispatchActionCommand.fromCliOptions(options);

    // Assert
    expect(command.mode).toBe(OperationMode.PUSH_SINGLE);
  });

  it('Should_ReturnPullSecretsToEnv_When_OnlyKeyIsProvided', () => {
    // Arrange
    const options: CliOptions = {
      key: 'MY_KEY',
    };

    // Act
    const command = DispatchActionCommand.fromCliOptions(options);

    // Assert
    expect(command.mode).toBe(OperationMode.PULL_SECRETS_TO_ENV);
  });
});
