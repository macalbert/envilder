import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cliRunner } from '../../src/cli/cliRunner';
import { run } from '../../src/index';

vi.mock('../../src/index', () => ({
  run: vi.fn(),
}));

describe('cliRunner', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    process.argv = [...originalArgv.slice(0, 2)];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Should_CallRunWithCorrectArguments_When_ValidArgumentsAreProvided', async () => {
    // Arrange
    const mockMapPath = 'path/to/mockMap.json';
    const mockEnvFilePath = 'path/to/.env';
    process.argv.push('--map', mockMapPath, '--envfile', mockEnvFilePath);

    // Act
    await cliRunner();

    // Assert
    expect(run).toHaveBeenCalledWith(mockMapPath, mockEnvFilePath);
  });

  it('Should_ThrowError_When_RequiredArgumentsAreMissing', async () => {
    // Arrange
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    // Act
    const action = cliRunner();

    // Assert
    await expect(action).rejects.toThrow('process.exit called');
  });

  it('Should_DisplayHelp_When_NoArgumentsAreProvided', async () => {
    // Arrange
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called with code 0');
    });

    // Act
    const action = cliRunner();

    // Assert
    await expect(action).rejects.toThrow('process.exit called with code 0');
  });
});
