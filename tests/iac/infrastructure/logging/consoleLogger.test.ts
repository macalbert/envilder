import type { MockInstance } from 'vitest';
import { ConsoleLogger } from '../../../../src/iac/infrastructure/logging/consoleLogger';

describe('ConsoleLogger', () => {
  let consoleLogSpy: MockInstance;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('info', () => {
    it('Should_LogMessage_When_Called', () => {
      // Arrange
      const logger = new ConsoleLogger();

      // Act
      logger.info('test message');

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
    });
  });

  describe('error', () => {
    it('Should_LogFormattedError_When_Called', () => {
      // Arrange
      const logger = new ConsoleLogger();
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at test.js:1:1';

      // Act
      logger.error(error);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error: Test error'),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
    });
  });

  describe('table', () => {
    it('Should_LogFormattedTable_When_Called', () => {
      // Arrange
      const logger = new ConsoleLogger();
      const entries = [
        { label: 'Region', value: 'us-east-1' },
        { label: 'Account', value: '***9012' },
      ];

      // Act
      logger.table(entries);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Region'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('us-east-1'),
      );
    });
  });
});
