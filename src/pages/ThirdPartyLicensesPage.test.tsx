/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

vi.mock('../hooks', () => ({
  useLanguage: () => ({
    t: {
      about: {
        thirdPartyLicenses: 'Third-Party Licenses',
        thirdPartyDesc: 'This app uses the following libraries.',
      },
      settings: { theme: 'Theme', light: 'Light', dark: 'Dark', system: 'System', language: 'Language' },
    },
    language: 'en',
    setLanguage: vi.fn(),
  }),
  useTheme: () => ({
    resolvedMode: 'dark',
    mode: 'system',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    colors: { bgPrimary: '#0a0b14' },
  }),
}));

vi.mock('react-icons/io5', () => ({
  IoArrowBack: (props: any) => <span data-testid="icon-arrow-back" {...props} />,
  IoChevronDown: (props: any) => <span data-testid="icon-chevron-down" {...props} />,
  IoChevronUp: (props: any) => <span data-testid="icon-chevron-up" {...props} />,
}));

vi.mock('../components/ui', () => ({
  SettingsMenu: () => <div data-testid="settings-menu" />,
}));

const MOCK_LICENSE_FILE = `This file was generated with the generate-license-file npm package!
https://www.npmjs.com/package/generate-license-file

The following npm packages may be included in this product:

 - react@19.1.0
 - react-dom@19.1.0

These packages each contain the following license:

MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy.

-----------

The following npm package may be included in this product:

 - @vercel/analytics@1.6.1

This package contains the following license:

Mozilla Public License Version 2.0`;

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

beforeEach(() => {
  cleanup();
  mockNavigate.mockClear();
  window.matchMedia = vi.fn(() => ({
    matches: true,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;

  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(MOCK_LICENSE_FILE),
  } as Response);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ThirdPartyLicensesPage', () => {
  const loadComponent = async () => {
    const mod = await import('./ThirdPartyLicensesPage');
    return mod.default;
  };

  it('should render page title', async () => {
    const ThirdPartyLicensesPage = await loadComponent();
    renderWithProviders(<ThirdPartyLicensesPage />);
    expect(screen.getByText('Third-Party Licenses')).toBeTruthy();
  });

  it('should fetch and display license groups', async () => {
    const ThirdPartyLicensesPage = await loadComponent();
    renderWithProviders(<ThirdPartyLicensesPage />);

    await waitFor(() => {
      expect(screen.getByText('react@19.1.0')).toBeTruthy();
      expect(screen.getByText('react-dom@19.1.0')).toBeTruthy();
      expect(screen.getByText('@vercel/analytics@1.6.1')).toBeTruthy();
    });

    expect(screen.getByText('3 packages / 2 licenses')).toBeTruthy();
  });

  it('should call navigate(-1) when clicking back button', async () => {
    const ThirdPartyLicensesPage = await loadComponent();
    renderWithProviders(<ThirdPartyLicensesPage />);
    const backButton = screen.getByTestId('icon-arrow-back').closest('button')!;
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should expand license text on click', async () => {
    const ThirdPartyLicensesPage = await loadComponent();
    renderWithProviders(<ThirdPartyLicensesPage />);

    await waitFor(() => {
      expect(screen.getByText('react@19.1.0')).toBeTruthy();
    });

    // License text should not be visible initially
    expect(screen.queryByText(/Permission is hereby granted/)).toBeNull();

    // Click to expand
    const reactBadge = screen.getByText('react@19.1.0');
    const sectionButton = reactBadge.closest('button')!;
    fireEvent.click(sectionButton);

    expect(screen.getByText(/Permission is hereby granted/)).toBeTruthy();
  });

  it('should show error on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const ThirdPartyLicensesPage = await loadComponent();
    renderWithProviders(<ThirdPartyLicensesPage />);

    await waitFor(() => {
      expect(screen.getByText('Error: HTTP 404')).toBeTruthy();
    });
  });
});
