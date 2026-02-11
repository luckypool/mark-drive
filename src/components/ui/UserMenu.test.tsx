/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// ---------- mock state ----------

const mockOnSignIn = vi.fn();
const mockOnSignOut = vi.fn();

vi.mock('react-icons/io5', () => {
  const stub = (name: string) => (props: any) => <span data-testid={`icon-${name}`} {...props} />;
  return {
    IoPersonOutline: stub('person'),
    IoLogOutOutline: stub('logout'),
    IoLogInOutline: stub('login'),
  };
});

vi.mock('../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: {
      home: {
        signIn: 'Sign In',
        signOut: 'Sign Out',
      },
    },
  }),
}));

// ---------- helpers ----------

import { UserMenu } from './UserMenu';

const authenticatedUser = {
  displayName: 'Test User',
  email: 'test@example.com',
  photoUrl: 'https://example.com/photo.jpg',
};

beforeEach(() => {
  cleanup();
  mockOnSignIn.mockClear();
  mockOnSignOut.mockClear();
});

// ---------- tests ----------

describe('UserMenu - unauthenticated', () => {
  it('renders trigger with placeholder icon', () => {
    render(
      <UserMenu isAuthenticated={false} userInfo={null} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    expect(screen.getByLabelText('Sign In')).toBeTruthy();
    expect(screen.getByTestId('icon-person')).toBeTruthy();
  });

  it('opens dropdown with sign in link when clicked', () => {
    render(
      <UserMenu isAuthenticated={false} userInfo={null} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    expect(screen.queryByText('Sign In')).toBeNull();
    fireEvent.click(screen.getByLabelText('Sign In'));
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('calls onSignIn when sign in link is clicked', () => {
    render(
      <UserMenu isAuthenticated={false} userInfo={null} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    fireEvent.click(screen.getByLabelText('Sign In'));
    fireEvent.click(screen.getByText('Sign In'));
    expect(mockOnSignIn).toHaveBeenCalledOnce();
  });

  it('closes dropdown after sign in click', () => {
    render(
      <UserMenu isAuthenticated={false} userInfo={null} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    fireEvent.click(screen.getByLabelText('Sign In'));
    fireEvent.click(screen.getByText('Sign In'));
    expect(screen.queryByText('Sign In')).toBeNull();
  });
});

describe('UserMenu - authenticated', () => {
  it('renders trigger with avatar image', () => {
    render(
      <UserMenu isAuthenticated={true} userInfo={authenticatedUser} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    const img = screen.getByAltText('Test User');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/photo.jpg');
  });

  it('renders placeholder when no photoUrl', () => {
    render(
      <UserMenu
        isAuthenticated={true}
        userInfo={{ ...authenticatedUser, photoUrl: '' }}
        onSignIn={mockOnSignIn}
        onSignOut={mockOnSignOut}
      />
    );
    expect(screen.getByTestId('icon-person')).toBeTruthy();
  });

  it('shows user info in dropdown', () => {
    render(
      <UserMenu isAuthenticated={true} userInfo={authenticatedUser} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    fireEvent.click(screen.getByLabelText('Test User'));
    expect(screen.getByText('Test User')).toBeTruthy();
    expect(screen.getByText('test@example.com')).toBeTruthy();
  });

  it('shows sign out button in dropdown', () => {
    render(
      <UserMenu isAuthenticated={true} userInfo={authenticatedUser} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    fireEvent.click(screen.getByLabelText('Test User'));
    expect(screen.getByText('Sign Out')).toBeTruthy();
  });

  it('calls onSignOut when sign out is clicked', () => {
    render(
      <UserMenu isAuthenticated={true} userInfo={authenticatedUser} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    fireEvent.click(screen.getByLabelText('Test User'));
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockOnSignOut).toHaveBeenCalledOnce();
  });

  it('closes dropdown after sign out click', () => {
    render(
      <UserMenu isAuthenticated={true} userInfo={authenticatedUser} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    fireEvent.click(screen.getByLabelText('Test User'));
    fireEvent.click(screen.getByText('Sign Out'));
    expect(screen.queryByText('Sign Out')).toBeNull();
  });

  it('closes dropdown on Escape key', () => {
    render(
      <UserMenu isAuthenticated={true} userInfo={authenticatedUser} onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />
    );
    fireEvent.click(screen.getByLabelText('Test User'));
    expect(screen.getByText('Test User')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('test@example.com')).toBeNull();
  });
});
