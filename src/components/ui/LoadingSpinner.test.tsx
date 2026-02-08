/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

beforeEach(() => cleanup());

describe('LoadingSpinner', () => {
  it('should render without crashing', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeTruthy();
  });

  it('should display message when provided', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeTruthy();
  });

  it('should not display message when not provided', () => {
    const { container } = render(<LoadingSpinner />);
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(0);
  });
});
