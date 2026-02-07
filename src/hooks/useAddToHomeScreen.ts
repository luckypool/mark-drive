import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'markdrive-a2hs-dismissed';
const DISMISS_DURATION_DAYS = 7;

function isIOSSafari(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // CriOS = Chrome on iOS, FxiOS = Firefox on iOS, EdgiOS = Edge on iOS
  const isSafari = !(/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua));

  return isIOS && isSafari;
}

function isStandalone(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as { standalone?: boolean }).standalone === true;
}

function isDismissed(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) return false;
    const dismissedAt = parseInt(dismissed, 10);
    const now = Date.now();
    const elapsed = now - dismissedAt;
    return elapsed < DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function useAddToHomeScreen() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isIOSSafari() && !isStandalone() && !isDismissed()) {
      setShouldShow(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setShouldShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }, []);

  return { shouldShow, dismiss, isStandalone: isStandalone() };
}
