/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OAuthOverlay } from './OAuthOverlay';

// useLanguage mock
vi.mock('../../hooks', () => ({
  useLanguage: () => ({
    t: {
      auth: {
        authenticating: 'Signing in with Google...',
        cancel: 'Cancel',
        timeoutError: 'Sign-in timed out.',
        timeoutErrorIos: 'Sign-in timed out (iOS).',
        popupBlocked: 'Popup was blocked.',
        popupBlockedIos: 'Popup was blocked (iOS).',
        popupBlockedPwa: 'Google Sign-in may not work from Home Screen.',
        thirdPartyCookieHint: 'Disable "Prevent Cross-Site Tracking".',
        openInSafari: 'Open in Safari',
      },
      viewer: {
        retry: 'Retry',
      },
    },
  }),
}));

const defaultProps = {
  isAuthenticating: false,
  error: null as string | null,
  onCancel: vi.fn(),
  onRetry: vi.fn(),
  onDismissError: vi.fn(),
};

beforeEach(() => {
  cleanup();
  defaultProps.onCancel = vi.fn();
  defaultProps.onRetry = vi.fn();
  defaultProps.onDismissError = vi.fn();
});

describe('OAuthOverlay', () => {
  it('should render nothing when not authenticating and no error', () => {
    const { container } = render(<OAuthOverlay {...defaultProps} />);
    expect(container.innerHTML).toBe('');
  });

  it('should render nothing for unknown error codes', () => {
    const { container } = render(
      <OAuthOverlay {...defaultProps} error="unknown_error" />
    );
    expect(container.innerHTML).toBe('');
  });

  // --- Authenticating state ---

  it('should show spinner and cancel button when authenticating', () => {
    render(<OAuthOverlay {...defaultProps} isAuthenticating={true} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Signing in with Google...')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('should call onCancel when cancel button is clicked during auth', () => {
    render(<OAuthOverlay {...defaultProps} isAuthenticating={true} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });

  // --- Error states ---

  it('should show timeout error message', () => {
    render(<OAuthOverlay {...defaultProps} error="auth_timeout" />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Sign-in timed out.')).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('should show iOS timeout error with hint', () => {
    render(<OAuthOverlay {...defaultProps} error="auth_timeout_ios" />);
    expect(screen.getByText('Sign-in timed out (iOS).')).toBeTruthy();
    expect(screen.getByText('Disable "Prevent Cross-Site Tracking".')).toBeTruthy();
  });

  it('should show popup blocked error', () => {
    render(<OAuthOverlay {...defaultProps} error="auth_popup_blocked" />);
    expect(screen.getByText('Popup was blocked.')).toBeTruthy();
    // Non-iOS error should not show hint
    expect(screen.queryByText('Disable "Prevent Cross-Site Tracking".')).toBeNull();
  });

  it('should show iOS popup blocked error with hint', () => {
    render(<OAuthOverlay {...defaultProps} error="auth_popup_blocked_ios" />);
    expect(screen.getByText('Popup was blocked (iOS).')).toBeTruthy();
    expect(screen.getByText('Disable "Prevent Cross-Site Tracking".')).toBeTruthy();
  });

  it('should show PWA popup blocked error with hint and Safari link', () => {
    render(<OAuthOverlay {...defaultProps} error="auth_popup_blocked_pwa" />);
    expect(screen.getByText('Google Sign-in may not work from Home Screen.')).toBeTruthy();
    expect(screen.getByText('Disable "Prevent Cross-Site Tracking".')).toBeTruthy();
    // Should show "Open in Safari" link instead of "Retry" button
    const safariLink = screen.getByText('Open in Safari');
    expect(safariLink).toBeTruthy();
    expect(safariLink.tagName).toBe('A');
    expect(safariLink.getAttribute('target')).toBe('_blank');
    // Should not show Retry button
    expect(screen.queryByText('Retry')).toBeNull();
  });

  // --- Error action buttons ---

  it('should call onRetry when retry button is clicked', () => {
    render(<OAuthOverlay {...defaultProps} error="auth_timeout" />);
    fireEvent.click(screen.getByText('Retry'));
    expect(defaultProps.onRetry).toHaveBeenCalledOnce();
  });

  it('should call onDismissError when dismiss button is clicked', () => {
    render(<OAuthOverlay {...defaultProps} error="auth_timeout" />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onDismissError).toHaveBeenCalledOnce();
  });

  // --- Priority: error takes precedence over authenticating ---

  it('should show error even when isAuthenticating is true', () => {
    render(
      <OAuthOverlay {...defaultProps} isAuthenticating={true} error="auth_timeout" />
    );
    // Error view should be shown, not the authenticating spinner
    expect(screen.getByText('Sign-in timed out.')).toBeTruthy();
    expect(screen.queryByText('Signing in with Google...')).toBeNull();
  });
});
