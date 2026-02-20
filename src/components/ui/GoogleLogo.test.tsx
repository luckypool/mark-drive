/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GoogleLogo } from './GoogleLogo';

describe('GoogleLogo', () => {
  it('should render an SVG element', () => {
    const { container } = render(<GoogleLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should use default size of 18', () => {
    const { container } = render(<GoogleLogo />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('18');
    expect(svg?.getAttribute('height')).toBe('18');
  });

  it('should accept custom size', () => {
    const { container } = render(<GoogleLogo size={32} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.getAttribute('height')).toBe('32');
  });

  it('should contain Google brand color paths', () => {
    const { container } = render(<GoogleLogo />);
    const paths = container.querySelectorAll('path');
    // Google logo has 5 paths (4 colored + 1 transparent)
    expect(paths.length).toBe(5);
  });
});
