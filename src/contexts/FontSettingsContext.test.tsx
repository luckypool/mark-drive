/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  FontSettingsProvider,
  useFontSettings,
  fontSizeMultipliers,
  fontFamilyStacks,
} from './FontSettingsContext';

vi.mock('../services/storage', () => ({
  storage: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => {}),
  },
}));

function TestConsumer() {
  const { settings, setFontSize, setFontFamily, getMultiplier, getFontStack } = useFontSettings();
  return (
    <div>
      <span data-testid="fontSize">{settings.fontSize}</span>
      <span data-testid="fontFamily">{settings.fontFamily}</span>
      <span data-testid="multiplier">{getMultiplier()}</span>
      <span data-testid="fontStack">{getFontStack()}</span>
      <button data-testid="set-large" onClick={() => setFontSize('large')}>Large</button>
      <button data-testid="set-small" onClick={() => setFontSize('small')}>Small</button>
      <button data-testid="set-serif" onClick={() => setFontFamily('serif')}>Serif</button>
      <button data-testid="set-sans" onClick={() => setFontFamily('sans-serif')}>Sans</button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FontSettingsProvider', () => {
  it('should provide default settings', async () => {
    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );
    expect(screen.getByTestId('fontSize').textContent).toBe('medium');
    expect(screen.getByTestId('fontFamily').textContent).toBe('system');
  });

  it('should update fontSize via setFontSize', async () => {
    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );
    act(() => {
      screen.getByTestId('set-large').click();
    });
    expect(screen.getByTestId('fontSize').textContent).toBe('large');
  });

  it('should update fontFamily via setFontFamily', async () => {
    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );
    act(() => {
      screen.getByTestId('set-serif').click();
    });
    expect(screen.getByTestId('fontFamily').textContent).toBe('serif');
  });

  it('should return correct multiplier for current fontSize', () => {
    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );
    expect(screen.getByTestId('multiplier').textContent).toBe(String(fontSizeMultipliers.medium));
  });

  it('should return correct multiplier after fontSize change', () => {
    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );
    act(() => {
      screen.getByTestId('set-small').click();
    });
    expect(screen.getByTestId('multiplier').textContent).toBe(String(fontSizeMultipliers.small));
  });

  it('should return correct fontStack for current fontFamily', () => {
    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );
    expect(screen.getByTestId('fontStack').textContent).toBe(fontFamilyStacks.system);
  });

  it('should return correct fontStack after fontFamily change', () => {
    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );
    act(() => {
      screen.getByTestId('set-sans').click();
    });
    expect(screen.getByTestId('fontStack').textContent).toBe(fontFamilyStacks['sans-serif']);
  });

  it('should load saved settings from storage', async () => {
    const { storage } = await import('../services/storage');
    vi.mocked(storage.getItem).mockResolvedValueOnce(
      JSON.stringify({ fontSize: 'large', fontFamily: 'serif' })
    );

    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('fontSize').textContent).toBe('large');
      expect(screen.getByTestId('fontFamily').textContent).toBe('serif');
    });
  });

  it('should handle storage.getItem error gracefully', async () => {
    const { storage } = await import('../services/storage');
    vi.mocked(storage.getItem).mockRejectedValueOnce(new Error('Storage error'));

    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );

    // Should not crash, should keep defaults
    await vi.waitFor(() => {
      expect(screen.getByTestId('fontSize').textContent).toBe('medium');
    });
  });

  it('should handle partial saved settings', async () => {
    const { storage } = await import('../services/storage');
    vi.mocked(storage.getItem).mockResolvedValueOnce(
      JSON.stringify({ fontSize: 'small' })
    );

    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('fontSize').textContent).toBe('small');
      // fontFamily should use default
      expect(screen.getByTestId('fontFamily').textContent).toBe('system');
    });
  });

  it('should save settings to storage on change', async () => {
    const { storage } = await import('../services/storage');

    render(
      <FontSettingsProvider>
        <TestConsumer />
      </FontSettingsProvider>
    );

    // Wait for initial load
    await vi.waitFor(() => {
      expect(storage.getItem).toHaveBeenCalled();
    });

    act(() => {
      screen.getByTestId('set-large').click();
    });

    await vi.waitFor(() => {
      expect(storage.setItem).toHaveBeenCalledWith(
        'markdrive-font-settings',
        expect.stringContaining('"large"')
      );
    });
  });
});

describe('useFontSettings', () => {
  it('should throw when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useFontSettings must be used within a FontSettingsProvider'
    );
    consoleError.mockRestore();
  });
});
