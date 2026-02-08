/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FontSettingsPanel } from './FontSettingsPanel';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { FontSettingsProvider } from '../../contexts/FontSettingsContext';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <FontSettingsProvider>
          {ui}
        </FontSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

beforeEach(() => {
  cleanup();
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

describe('FontSettingsPanel', () => {
  it('should not render when visible is false', () => {
    const { container } = renderWithProviders(
      <FontSettingsPanel visible={false} onClose={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('should render when visible is true', () => {
    renderWithProviders(
      <FontSettingsPanel visible={true} onClose={vi.fn()} />
    );
    expect(screen.getByText('Display Settings')).toBeTruthy();
  });

  it('should show font size options', () => {
    renderWithProviders(
      <FontSettingsPanel visible={true} onClose={vi.fn()} />
    );
    expect(screen.getByText('Small')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Large')).toBeTruthy();
  });

  it('should show font family options', () => {
    renderWithProviders(
      <FontSettingsPanel visible={true} onClose={vi.fn()} />
    );
    expect(screen.getByText('System')).toBeTruthy();
    expect(screen.getByText('Serif')).toBeTruthy();
    expect(screen.getByText('Sans-serif')).toBeTruthy();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <FontSettingsPanel visible={true} onClose={onClose} />
    );
    // Close button is the first button in the panel
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not close when panel body is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <FontSettingsPanel visible={true} onClose={onClose} />
    );
    // Click on the title text (inside the panel — propagation is stopped)
    fireEvent.click(screen.getByText('Font Size'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should show preview section', () => {
    renderWithProviders(
      <FontSettingsPanel visible={true} onClose={vi.fn()} />
    );
    expect(screen.getByText('Preview')).toBeTruthy();
    expect(screen.getByText('The quick brown fox jumps over the lazy dog.')).toBeTruthy();
  });
});
