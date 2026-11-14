import { describe, expect, it } from 'vitest';
import { HeroPause } from '../../../src/website/src/utils/hero-pause';

describe('HeroPause', () => {
  it('Should_KeepPlaying_When_FocusReturnsWithoutKeyboard', () => {
    // Arrange
    const pause = new HeroPause();
    pause.pointerEnter();
    pause.pointerLeave();

    // Act
    pause.focusIn(false);

    // Assert
    expect(pause.paused).toBe(false);
  });

  it('Should_Pause_When_KeyboardFocusEntersTerminal', () => {
    // Arrange
    const pause = new HeroPause();

    // Act
    pause.focusIn(true);

    // Assert
    expect(pause.paused).toBe(true);
  });

  it('Should_StayPaused_When_PointerLeavesWhileKeyboardFocused', () => {
    // Arrange
    const pause = new HeroPause();
    pause.focusIn(true);
    pause.pointerEnter();

    // Act
    pause.pointerLeave();

    // Assert
    expect(pause.paused).toBe(true);
  });

  it('Should_StayPaused_When_FocusLeavesWhilePointerHovers', () => {
    // Arrange
    const pause = new HeroPause();
    pause.pointerEnter();
    pause.focusIn(true);

    // Act
    pause.focusOut();

    // Assert
    expect(pause.paused).toBe(true);
  });

  it('Should_StayPaused_When_UserPausedAndPointerLeaves', () => {
    // Arrange
    const pause = new HeroPause();
    pause.toggleUserPause();
    pause.pointerEnter();

    // Act
    pause.pointerLeave();

    // Assert
    expect(pause.paused).toBe(true);
  });
});
