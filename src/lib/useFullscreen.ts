import { useCallback, useEffect, useState, RefObject } from 'react';

export interface UseFullscreenOptions {
  onEnter?: () => void;
  onExit?: () => void;
  enableKeyboardShortcut?: boolean;
}

export interface UseFullscreenReturn {
  /** Whether currently in either native browser fullscreen or edge-to-edge fallback */
  isFullscreen: boolean;
  /** Whether browser native HTML5 fullscreen is active */
  isNativeFullscreen: boolean;
  /** Whether CSS edge-to-edge immersive fallback mode is active (when native API is unavailable or errored) */
  isFallbackImmersive: boolean;
  /** Whether UI chrome is hidden for maximum immersion (Cinematic Mode) */
  isCinematic: boolean;
  /** Whether native fullscreen is supported by this browser environment */
  isSupported: boolean;
  /** Toggle fullscreen on/off */
  toggleFullscreen: () => Promise<void>;
  /** Request entering fullscreen (or fallback) */
  enterFullscreen: () => Promise<void>;
  /** Exit fullscreen or fallback */
  exitFullscreen: () => Promise<void>;
  /** Toggle cinematic UI-hide mode */
  toggleCinematic: () => void;
  /** Set cinematic UI-hide mode explicitly */
  setCinematic: (value: boolean) => void;
}

export function useFullscreen(
  targetRef: RefObject<HTMLElement | null>,
  options: UseFullscreenOptions = {}
): UseFullscreenReturn {
  const { onEnter, onExit, enableKeyboardShortcut = true } = options;

  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [isFallbackImmersive, setIsFallbackImmersive] = useState<boolean>(false);
  const [isCinematic, setIsCinematic] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Check support on mount
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const supported = Boolean(
      document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
    );
    setIsSupported(supported);
  }, []);

  const enterFullscreen = useCallback(async () => {
    const el = targetRef.current;
    if (!el) return;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      } else if ((el as any).mozRequestFullScreen) {
        await (el as any).mozRequestFullScreen();
      } else if ((el as any).msRequestFullscreen) {
        await (el as any).msRequestFullscreen();
      } else {
        // Native API not available, switch to edge-to-edge CSS fallback
        setIsFallbackImmersive(true);
        onEnter?.();
      }
    } catch (err) {
      console.warn('[useFullscreen] Native fullscreen request failed, falling back to CSS immersive mode:', err);
      setIsFallbackImmersive(true);
      onEnter?.();
    }
  }, [targetRef, onEnter]);

  const exitFullscreen = useCallback(async () => {
    if (isFallbackImmersive) {
      setIsFallbackImmersive(false);
      onExit?.();
      return;
    }

    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen && (document as any).webkitFullscreenElement) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen && (document as any).mozFullScreenElement) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen && (document as any).msFullscreenElement) {
        await (document as any).msExitFullscreen();
      }
    } catch (err) {
      console.warn('[useFullscreen] Error exiting fullscreen:', err);
    } finally {
      setIsFallbackImmersive(false);
    }
  }, [isFallbackImmersive, onExit]);

  const toggleFullscreen = useCallback(async () => {
    if (isNativeFullscreen || isFallbackImmersive) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isNativeFullscreen, isFallbackImmersive, enterFullscreen, exitFullscreen]);

  const toggleCinematic = useCallback(() => {
    setIsCinematic((prev) => !prev);
  }, []);

  // Listen to native fullscreen changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFullscreenChange = () => {
      const activeEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      const targetEl = targetRef.current;
      const isActive = Boolean(activeEl && targetEl && (activeEl === targetEl || targetEl.contains(activeEl)));

      setIsNativeFullscreen(isActive);

      if (isActive) {
        setIsFallbackImmersive(false);
        onEnter?.();
      } else if (!isFallbackImmersive) {
        onExit?.();
      }
    };

    const handleFullscreenError = (e: Event) => {
      console.warn('[useFullscreen] Fullscreen error encountered:', e);
      // Fallback cleanly
      setIsNativeFullscreen(false);
      setIsFallbackImmersive(true);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    document.addEventListener('fullscreenerror', handleFullscreenError);
    document.addEventListener('webkitfullscreenerror', handleFullscreenError);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      document.removeEventListener('fullscreenerror', handleFullscreenError);
      document.removeEventListener('webkitfullscreenerror', handleFullscreenError);
    };
  }, [targetRef, isFallbackImmersive, onEnter, onExit]);

  // Global keyboard shortcuts (F: toggle fullscreen, C: toggle cinematic, Esc: exit fallback)
  useEffect(() => {
    if (!enableKeyboardShortcut || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      const isInput =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if (isInput) return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        toggleCinematic();
      } else if (e.key === 'Escape' && isFallbackImmersive) {
        e.preventDefault();
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcut, isFallbackImmersive, toggleFullscreen, toggleCinematic, exitFullscreen]);

  // Prevent accidental scroll under overlays when in fallback immersive mode
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isFallbackImmersive) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isFallbackImmersive]);

  return {
    isFullscreen: isNativeFullscreen || isFallbackImmersive,
    isNativeFullscreen,
    isFallbackImmersive,
    isCinematic,
    isSupported,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleCinematic,
    setCinematic: setIsCinematic,
  };
}
