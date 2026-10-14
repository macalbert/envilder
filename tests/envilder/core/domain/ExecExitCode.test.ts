import { describe, expect, it } from 'vitest';
import {
  EXEC_COMMAND_NOT_EXECUTABLE,
  EXEC_COMMAND_NOT_FOUND,
  EXEC_ENVILDER_FAILURE,
  exitCodeForChild,
} from '../../../../src/envilder/core/domain/ExecExitCode';

const posixSignalNumbers: Partial<Record<NodeJS.Signals, number>> = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGKILL: 9,
  SIGTERM: 15,
};

function signalNumber(signal: NodeJS.Signals): number {
  return posixSignalNumbers[signal] ?? 0;
}

describe('ExecExitCode', () => {
  it.each([
    [0, 0],
    [1, 1],
    [3, 3],
    [255, 255],
  ])(
    'Should_PropagateChildExitCode_When_ChildExitsWithCode%i',
    (code, expected) => {
      // Act
      const actual = exitCodeForChild({ code, signal: null }, signalNumber);

      // Assert
      expect(actual).toBe(expected);
    },
  );

  it.each([
    ['SIGKILL', 137],
    ['SIGTERM', 143],
    ['SIGINT', 130],
    ['SIGHUP', 129],
  ] as const)(
    'Should_ExitWith128PlusSignal_When_ChildIsKilledBy%s',
    (signal, expected) => {
      // Act
      const actual = exitCodeForChild({ code: null, signal }, signalNumber);

      // Assert
      expect(actual).toBe(expected);
    },
  );

  it('Should_ExposeGnuEnvExitCodes_When_ExecModeReportsEnvilderOrSpawnFailures', () => {
    // Act
    const actual = [
      EXEC_ENVILDER_FAILURE,
      EXEC_COMMAND_NOT_EXECUTABLE,
      EXEC_COMMAND_NOT_FOUND,
    ];

    // Assert
    expect(actual).toEqual([125, 126, 127]);
  });
});
