import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {VideoPlayer} from '@amazon-devices/react-native-w3cmedia/dist/headless';
import {
  KeplerVideoSurfaceView,
  EventListener,
} from '@amazon-devices/react-native-w3cmedia';
import {FocusableButton} from '../components/FocusableButton';
import {colors, radius, spacing, type} from '../theme/theme';
import {Navigation, Route} from '../navigation/types';

interface Props {
  route: Extract<Route, {name: 'player'}>;
  navigation: Navigation;
}

type Status = 'loading' | 'playing' | 'paused' | 'ended' | 'error';

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * URL-mode media playback (Vega W3C VideoPlayer) for a clear MP4.
 *
 * Lifecycle per the Vega docs: `new VideoPlayer()` -> `initialize()` ->
 * add listeners -> `setSurfaceHandle`. The surface handle can arrive before or
 * after `initialize()` resolves, so both paths funnel through `attachIfReady`,
 * which only wires src/surface once BOTH the player is initialized and the
 * surface exists. Everything is torn down on unmount so audio never leaks.
 */
export const PlayerScreen = ({route, navigation}: Props) => {
  const {item} = route;

  const videoRef = useRef<VideoPlayer | null>(null);
  const initializedRef = useRef(false);
  const surfaceHandleRef = useRef<string | null>(null);
  const attachedRef = useRef(false);

  const [status, setStatus] = useState<Status>('loading');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /** Wire src + surface exactly once, when both player and surface are ready. */
  const attachIfReady = useCallback(() => {
    const video = videoRef.current;
    if (
      attachedRef.current ||
      !video ||
      !initializedRef.current ||
      !surfaceHandleRef.current
    ) {
      return;
    }
    attachedRef.current = true;
    video.setSurfaceHandle(surfaceHandleRef.current);
    video.autoplay = true;
    video.src = item.videoUrl;
  }, [item.videoUrl]);

  useEffect(() => {
    const video = new VideoPlayer();
    videoRef.current = video;

    const onPlaying: EventListener = () => setStatus('playing');
    const onPause: EventListener = () => setStatus('paused');
    const onEnded: EventListener = () => setStatus('ended');
    const onError: EventListener = () => setStatus('error');
    const onLoadedMetadata: EventListener = () =>
      setDuration(videoRef.current?.duration ?? 0);
    const onTimeUpdate: EventListener = () =>
      setCurrentTime(videoRef.current?.currentTime ?? 0);

    video
      .initialize()
      .then(() => {
        if (videoRef.current !== video) return; // unmounted mid-init
        initializedRef.current = true;
        video.addEventListener('playing', onPlaying);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded);
        video.addEventListener('error', onError);
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('timeupdate', onTimeUpdate);
        attachIfReady();
      })
      .catch(() => setStatus('error'));

    return () => {
      const v = videoRef.current;
      videoRef.current = null;
      initializedRef.current = false;
      attachedRef.current = false;
      if (!v) return;
      try {
        v.pause();
      } catch {
        // best-effort teardown; player may already be torn down
      }
      if (surfaceHandleRef.current) {
        try {
          v.clearSurfaceHandle(surfaceHandleRef.current);
        } catch {
          // surface may already be detached
        }
      }
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('error', onError);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.deinitialize().catch(() => {});
    };
  }, [attachIfReady]);

  const onSurfaceViewCreated = useCallback(
    (handle: string) => {
      surfaceHandleRef.current = handle;
      attachIfReady();
    },
    [attachIfReady],
  );

  const onSurfaceViewDestroyed = useCallback((handle: string) => {
    try {
      videoRef.current?.clearSurfaceHandle(handle);
    } catch {
      // surface may already be detached
    }
    surfaceHandleRef.current = null;
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (status === 'playing') {
      video.pause();
    } else if (status === 'ended') {
      video.currentTime = 0;
      video.play().catch(() => setStatus('error'));
    } else {
      video.play().catch(() => setStatus('error'));
    }
  }, [status]);

  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const playLabel = status === 'playing' ? 'Pause' : status === 'ended' ? 'Replay' : 'Play';

  return (
    <View style={styles.root}>
      <KeplerVideoSurfaceView
        style={StyleSheet.absoluteFill}
        scalingmode="fit"
        onSurfaceViewCreated={onSurfaceViewCreated}
        onSurfaceViewDestroyed={onSurfaceViewDestroyed}
      />

      {status === 'loading' ? (
        <View style={styles.center} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading {item.title}…</Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Couldn't play {item.title}. The source may be unavailable.
          </Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.attribution}>{item.attribution}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${progress}%`}]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(currentTime)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.buttonRow}>
          <FocusableButton
            label={playLabel}
            primary
            hasTVPreferredFocus
            onPress={togglePlay}
            testID="btn-play-pause"
            style={styles.button}
          />
          <FocusableButton
            label="‹ Back to plan"
            onPress={navigation.goBack}
            testID="btn-back-to-plan"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...type.body,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  errorText: {
    ...type.heading,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.overlay,
  },
  title: {
    ...type.title,
    color: colors.textPrimary,
  },
  attribution: {
    ...type.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  time: {
    ...type.caption,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  button: {
    marginRight: spacing.md,
  },
});
