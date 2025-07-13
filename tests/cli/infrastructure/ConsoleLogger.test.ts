import { describe, expect, it, vi } from 'vitest';
import { ConsoleLogger } from '../../../src/cli/infrastructure/Logger/ConsoleLogger';

describe('ConsoleLogger', () => {
  const sut = new ConsoleLogger();

  it('Should_DelegateConsoleLog_When_CallInfo', () => {
    // Arrange
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Act
    sut.info('hello');

    // Assert
    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('Should_DelegateConsoleWarn_When_CallWarn', () => {
    // Arrange
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    sut.warn('warn');

    // Assert
    expect(spy).toHaveBeenCalledWith('warn');
  });

  it('Should_DelegateConsoleError_When_CallError', () => {
    // Arrange
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    sut.error('error');

    // Assert
    expect(spy).toHaveBeenCalledWith('error');
  });
});
