/**
 * Jest mock for @amazon-devices/react-native-w3cmedia.
 *
 * The real package binds to the `KeplerW3CMediaTurboModule` native module,
 * which isn't registered in the Node/Jest environment. This stub provides the
 * surface our code imports (VideoPlayer + KeplerVideoSurfaceView) so screens
 * that touch media can be imported and unit-tested without a device.
 */
import * as React from 'react';

export class VideoPlayer {
  autoplay = false;
  src = '';
  currentTime = 0;
  duration = 0;

  initialize(): Promise<void> {
    return Promise.resolve();
  }
  deinitialize(): Promise<void> {
    return Promise.resolve();
  }
  addEventListener(): void {}
  removeEventListener(): void {}
  setSurfaceHandle(): void {}
  clearSurfaceHandle(): void {}
  play(): Promise<void> {
    return Promise.resolve();
  }
  pause(): void {}
}

export const KeplerVideoSurfaceView = (): React.ReactElement | null => null;

// `EventListener` is imported only as a type in app code; a runtime stub keeps
// the named import resolvable under Jest's CommonJS interop.
export const EventListener = undefined;
