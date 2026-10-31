import { describe, expect, it, vi } from 'vitest';
import type { ILogger } from '../../../../../src/envilder/core/domain/ports/ILogger';
import { GitHubActionsLogger } from '../../../../../src/envilder/core/infrastructure/github/GitHubActionsLogger';

function createInnerLogger(): ILogger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

/** Mirrors .NET `TrimStart()`, which also strips U+0085 (NEL). */
function trimStartLikeRunner(line: string): string {
  return line.replace(/^[\s\u0085]+/, '');
}

describe('GitHubActionsLogger', () => {
  it.each(['info', 'warn', 'error'] as const)(
    'Should_DelegateUnchanged_When_%sMessageIsPlainText',
    (level) => {
      // Arrange
      const inner = createInnerLogger();
      const sut = new GitHubActionsLogger(inner);

      // Act
      sut[level]('📄 Env file: .env');

      // Assert
      expect(inner[level]).toHaveBeenCalledWith('📄 Env file: .env');
    },
  );

  it.each([
    ['LF', '.env\n::stop-commands::token', '.env\\n::stop-commands::token'],
    ['CRLF', '.env\r\n::warning::forged', '.env\\r\\n::warning::forged'],
  ])(
    'Should_KeepMessageOnOneLine_When_MessageContains%s',
    (_, message, expected) => {
      // Arrange
      const inner = createInnerLogger();
      const sut = new GitHubActionsLogger(inner);

      // Act
      sut.info(message);

      // Assert
      expect(inner.info).toHaveBeenCalledWith(expected);
    },
  );

  it.each([
    '::stop-commands::token',
    '   ::warning::forged',
    // .NET's TrimStart, which the runner uses, also strips NEL.
    '\u0085::stop-commands::token',
  ])('Should_NotStartWithWorkflowCommand_When_MessageIs_%s', (message) => {
    // Arrange
    const inner = createInnerLogger();
    const sut = new GitHubActionsLogger(inner);

    // Act
    sut.error(message);

    // Assert
    const [actual] = vi.mocked(inner.error).mock.calls[0];
    expect(trimStartLikeRunner(actual).startsWith('::')).toBe(false);
  });

  it('Should_NeutralizeLegacyWorkflowCommand_When_MessageContainsIt', () => {
    // Arrange
    const inner = createInnerLogger();
    const sut = new GitHubActionsLogger(inner);

    // Act
    sut.info("Invalid name 'a##[add-mask]b'");

    // Assert
    const [actual] = vi.mocked(inner.info).mock.calls[0];
    expect(actual).not.toContain('##[');
  });
});
