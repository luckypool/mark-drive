/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Button } from './Button';
import { ThemeProvider } from '../../contexts/ThemeContext';

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

beforeEach(() => {
  cleanup();
  // stub matchMedia for ThemeProvider
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

describe('Button', () => {
  it('should render children text', () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('should render as a <button> element', () => {
    renderWithProviders(<Button>Test</Button>);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    renderWithProviders(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should call onPress when clicked (RN compat)', () => {
    const handlePress = vi.fn();
    renderWithProviders(<Button onPress={handlePress}>Press</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledOnce();
  });

  it('should prefer onClick over onPress', () => {
    const handleClick = vi.fn();
    const handlePress = vi.fn();
    renderWithProviders(
      <Button onClick={handleClick} onPress={handlePress}>Both</Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithProviders(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
  });

  it('should be disabled when loading', () => {
    renderWithProviders(<Button loading>Loading</Button>);
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
  });

  it('should not show children text when loading', () => {
    renderWithProviders(<Button loading>Hidden</Button>);
    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('should render icon alongside text', () => {
    renderWithProviders(
      <Button icon={<span data-testid="icon">★</span>}>With Icon</Button>
    );
    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText('With Icon')).toBeTruthy();
  });

  it('should apply custom style', () => {
    renderWithProviders(<Button style={{ marginTop: '10px' }}>Styled</Button>);
    const btn = screen.getByRole('button');
    expect(btn.style.marginTop).toBe('10px');
  });
});
