/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../contexts/ThemeContext';

beforeEach(() => {
  cleanup();
  try { localStorage.clear(); } catch { /* jsdom may not provide localStorage */ }
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

function renderWithTheme() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  it('should render a button', () => {
    renderWithTheme();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should render an SVG icon', () => {
    const { container } = renderWithTheme();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('should have an aria-label with theme info', () => {
    renderWithTheme();
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toMatch(/Theme:/);
  });

  it('should cycle theme on click', () => {
    renderWithTheme();
    const button = screen.getByRole('button');
    const initialLabel = button.getAttribute('aria-label');

    fireEvent.click(button);

    const nextLabel = button.getAttribute('aria-label');
    expect(nextLabel).not.toBe(initialLabel);
  });

  it('should cycle through all three themes', () => {
    renderWithTheme();
    const button = screen.getByRole('button');

    const labels: string[] = [];
    for (let i = 0; i < 4; i++) {
      labels.push(button.getAttribute('aria-label') || '');
      fireEvent.click(button);
    }

    // After 3 clicks we should be back to the first label
    expect(labels[3]).toBe(labels[0]);
    // All three intermediate labels should be different
    const uniqueLabels = new Set(labels.slice(0, 3));
    expect(uniqueLabels.size).toBe(3);
  });
});
