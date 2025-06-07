import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEnvilder } from '../../../src/cli/domain/EnvilderFactory';

describe('CLI', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    process.argv = [...originalArgv.slice(0, 2)];
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.argv = originalArgv;
  });

  it('Should_CallRunWithCorrectArguments_When_ValidArgumentsAreProvided', async () => {
    // Arrange
    const mockMapPath = 'path/to/mockMap.json';
    const mockEnvFilePath = 'path/to/.env';
    process.argv.push('--map', mockMapPath, '--envfile', mockEnvFilePath);
    const sut = createEnvilder();
    const spy = vi.spyOn(sut, 'run').mockResolvedValue();

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    expect(spy).toHaveBeenCalledWith(mockMapPath, mockEnvFilePath);
  });

  it('Should_ThrowError_When_RequiredArgumentsAreMissing', async () => {
    // Arrange
    const sut = createEnvilder();

    // Act
    const action = sut.run('', '');

    // Assert
    await expect(action).rejects.toThrowError();
  });

  it('Should_CallRunWithCorrectArgumentsIncludingProfile_When_ProfileIsProvided', async () => {
    // Arrange
    const mockMapPath = 'path/to/mockMap.json';
    const mockEnvFilePath = 'path/to/.env';
    const mockProfile = 'test-profile';
    process.argv.push('--map', mockMapPath, '--envfile', mockEnvFilePath, '--profile', mockProfile);
    const sut = createEnvilder(mockProfile);
    const spy = vi.spyOn(sut, 'run').mockResolvedValue();

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    expect(spy).toHaveBeenCalledWith(mockMapPath, mockEnvFilePath);
  });
});
