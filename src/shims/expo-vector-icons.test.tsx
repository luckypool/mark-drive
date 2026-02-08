/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Ionicons } from './expo-vector-icons';

describe('Ionicons shim', () => {
  it('should render a known icon as an SVG', () => {
    const { container } = render(<Ionicons name="close" size={24} color="#fff" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('should apply size and color', () => {
    const { container } = render(<Ionicons name="search" size={32} color="red" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('width')).toBe('32');
    expect(svg!.getAttribute('height')).toBe('32');
    expect(svg!.getAttribute('color')).toBe('red');
  });

  it('should use default size and color', () => {
    const { container } = render(<Ionicons name="menu" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('width')).toBe('24');
    expect(svg!.getAttribute('height')).toBe('24');
  });

  it('should render nothing for an unknown icon name', () => {
    const { container } = render(<Ionicons name="nonexistent-icon" />);
    expect(container.innerHTML).toBe('');
  });

  it('should apply custom style', () => {
    const { container } = render(
      <Ionicons name="close" style={{ marginLeft: '8px' }} />
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.style.marginLeft).toBe('8px');
  });

  it('should expose glyphMap with all mapped icon names', () => {
    expect(Ionicons.glyphMap).toBeDefined();
    expect(typeof Ionicons.glyphMap).toBe('object');
    expect('close' in Ionicons.glyphMap).toBe(true);
    expect('search' in Ionicons.glyphMap).toBe(true);
    expect('menu' in Ionicons.glyphMap).toBe(true);
    expect('sunny-outline' in Ionicons.glyphMap).toBe(true);
  });
});
