/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFoundPage from './NotFoundPage';

vi.mock('react-router', () => ({
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
}));

describe('NotFoundPage', () => {
  it('should display "Page Not Found" title', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('Page Not Found')).toBeTruthy();
  });

  it('should have a link to home page', () => {
    render(<NotFoundPage />);

    const link = screen.getByText('Go to Home');
    expect(link).toBeTruthy();
    expect(link.closest('a')?.getAttribute('href')).toBe('/');
  });
});
