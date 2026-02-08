/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IconButton } from './IconButton';

beforeEach(() => cleanup());

describe('IconButton', () => {
  const icon = <span data-testid="icon">X</span>;

  it('should render as a <button> element', () => {
    render(<IconButton icon={icon} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should render the icon', () => {
    render(<IconButton icon={icon} />);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<IconButton icon={icon} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should call onPress when clicked (RN compat)', () => {
    const handlePress = vi.fn();
    render(<IconButton icon={icon} onPress={handlePress} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<IconButton icon={icon} disabled />);
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
  });

  it('should be disabled when loading', () => {
    render(<IconButton icon={icon} loading />);
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
  });

  it('should not render icon when loading', () => {
    render(<IconButton icon={icon} loading />);
    expect(screen.queryByTestId('icon')).toBeNull();
  });

  it('should apply custom style', () => {
    render(<IconButton icon={icon} style={{ marginLeft: '5px' }} />);
    expect(screen.getByRole('button').style.marginLeft).toBe('5px');
  });
});
