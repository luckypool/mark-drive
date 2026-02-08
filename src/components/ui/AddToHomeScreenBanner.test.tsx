/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AddToHomeScreenBanner } from './AddToHomeScreenBanner';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LanguageProvider } from '../../contexts/LanguageContext';

// Mock useAddToHomeScreen so we can control shouldShow
const mockDismiss = vi.fn();
let mockShouldShow = true;

vi.mock('../../hooks/useAddToHomeScreen', () => ({
  useAddToHomeScreen: () => ({
    shouldShow: mockShouldShow,
    dismiss: mockDismiss,
    isStandalone: false,
  }),
}));

beforeEach(() => {
  cleanup();
  mockShouldShow = true;
  mockDismiss.mockClear();
  window.matchMedia = vi.fn(() => ({
    matches: true,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

function renderWithProviders() {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <AddToHomeScreenBanner />
      </LanguageProvider>
    </ThemeProvider>
  );
}

describe('AddToHomeScreenBanner', () => {
  it('should render when shouldShow is true', () => {
    renderWithProviders();
    expect(screen.getByText('Add to Home Screen')).toBeTruthy();
  });

  it('should not render when shouldShow is false', () => {
    mockShouldShow = false;
    const { container } = renderWithProviders();
    expect(container.innerHTML).toBe('');
  });

  it('should show description text', () => {
    renderWithProviders();
    expect(screen.getByText('Install MarkDrive for quick access')).toBeTruthy();
  });

  it('should render SVG icons', () => {
    const { container } = renderWithProviders();
    const svgs = container.querySelectorAll('svg');
    // 3 icons: add-circle-outline, share-outline, close
    expect(svgs.length).toBe(3);
  });

  it('should call dismiss when close button is clicked', () => {
    renderWithProviders();
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockDismiss).toHaveBeenCalledOnce();
  });
});
