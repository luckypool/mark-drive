/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorPage from './ErrorPage';

const mockUseRouteError = vi.fn();

vi.mock('react-router', () => ({
  useRouteError: () => mockUseRouteError(),
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
}));

describe('ErrorPage', () => {
  it('should display Error instance message', () => {
    mockUseRouteError.mockReturnValue(new Error('Something broke'));

    render(<ErrorPage />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Something broke')).toBeTruthy();
  });

  it('should display fallback message for non-Error objects', () => {
    mockUseRouteError.mockReturnValue({ status: 404 });

    render(<ErrorPage />);

    expect(screen.getByText('An unexpected error occurred.')).toBeTruthy();
  });

  it('should have a link to home page', () => {
    mockUseRouteError.mockReturnValue(new Error('test'));

    render(<ErrorPage />);

    const link = screen.getByText('Go to Home');
    expect(link).toBeTruthy();
    expect(link.closest('a')?.getAttribute('href')).toBe('/');
  });
});
