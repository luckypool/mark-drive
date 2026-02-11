/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent } from './analytics';

describe('trackEvent', () => {
  const originalGtag = window.gtag;

  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>).gtag;
  });

  afterEach(() => {
    if (originalGtag) {
      window.gtag = originalGtag;
    } else {
      delete (window as unknown as Record<string, unknown>).gtag;
    }
  });

  it('calls window.gtag when it exists', () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackEvent('login', { method: 'Google' });

    expect(mockGtag).toHaveBeenCalledWith('event', 'login', { method: 'Google' });
  });

  it('does not throw when window.gtag is undefined', () => {
    expect(() => trackEvent('login')).not.toThrow();
  });

  it('passes name and params correctly', () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackEvent('open_drive_file', { source: 'picker' });

    expect(mockGtag).toHaveBeenCalledTimes(1);
    expect(mockGtag).toHaveBeenCalledWith('event', 'open_drive_file', { source: 'picker' });
  });

  it('works without params', () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackEvent('try_now_click');

    expect(mockGtag).toHaveBeenCalledWith('event', 'try_now_click', undefined);
  });
});
