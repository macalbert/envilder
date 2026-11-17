/**
 * Decides whether the hero terminal demo is paused. Hover and keyboard
 * focus pause it while they last; the pause button holds it until the user
 * resumes (touch users have no hover to stop the loop).
 *
 * Only keyboard focus counts. A click leaves the focusable terminal body
 * focused, and the browser re-fires focusin on it whenever the window
 * regains focus, which would freeze playback with the pointer elsewhere.
 */
export class HeroPause {
  private hovering = false;
  private keyboardFocused = false;
  private userPaused = false;

  get paused(): boolean {
    return this.hovering || this.keyboardFocused || this.userPaused;
  }

  get pausedByUser(): boolean {
    return this.userPaused;
  }

  pointerEnter(): void {
    this.hovering = true;
  }

  pointerLeave(): void {
    this.hovering = false;
  }

  focusIn(fromKeyboard: boolean): void {
    this.keyboardFocused = fromKeyboard;
  }

  focusOut(): void {
    this.keyboardFocused = false;
  }

  toggleUserPause(): void {
    this.userPaused = !this.userPaused;
  }
}
