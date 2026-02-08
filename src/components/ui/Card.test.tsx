/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Card } from './Card';

beforeEach(() => cleanup());

describe('Card', () => {
  it('should render children', () => {
    render(<Card><span>Card content</span></Card>);
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const { container } = render(<Card style={{ padding: '20px' }}>Content</Card>);
    expect((container.firstChild as HTMLElement).style.padding).toBe('20px');
  });
});
