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
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('18');
    expect(svg.getAttribute('height')).toBe('18');
  });

  it('should accept a custom size', () => {
    const { container } = render(<GoogleLogo size={32} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
  });

  it('should render all Google brand color paths', () => {
    const { container } = render(<GoogleLogo />);
    const paths = container.querySelectorAll('path');
    // 4 colored paths + 1 transparent path
    expect(paths.length).toBe(5);

    const fills = Array.from(paths).map(p => p.getAttribute('fill'));
    expect(fills).toContain('#EA4335');
    expect(fills).toContain('#4285F4');
    expect(fills).toContain('#FBBC05');
    expect(fills).toContain('#34A853');
  });

  it('should have viewBox 0 0 48 48', () => {
    const { container } = render(<GoogleLogo />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 48 48');
  });
});
