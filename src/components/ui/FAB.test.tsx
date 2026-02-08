/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FAB } from './FAB';

beforeEach(() => cleanup());

describe('FAB', () => {
  const icon = <span data-testid="fab-icon">+</span>;

  it('should render as a <button> element', () => {
    render(<FAB icon={icon} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should render the icon', () => {
    render(<FAB icon={icon} />);
    expect(screen.getByTestId('fab-icon')).toBeTruthy();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<FAB icon={icon} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should call onPress when clicked (RN compat)', () => {
    const handlePress = vi.fn();
    render(<FAB icon={icon} onPress={handlePress} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledOnce();
  });

  it('should apply custom style', () => {
    render(<FAB icon={icon} style={{ bottom: '40px' }} />);
    expect(screen.getByRole('button').style.bottom).toBe('40px');
  });
});
