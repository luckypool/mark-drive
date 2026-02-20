/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('should render children', () => {
    render(<Tooltip label="Help text"><button>Hover me</button></Tooltip>);
    expect(screen.getByText('Hover me')).toBeTruthy();
  });

  it('should set data-tooltip attribute with label', () => {
    const { container } = render(<Tooltip label="Help text"><span>Content</span></Tooltip>);
    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('data-tooltip')).toBe('Help text');
  });

  it('should apply wrapper class', () => {
    const { container } = render(<Tooltip label="Tip"><span>Content</span></Tooltip>);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('wrapper');
  });
});
