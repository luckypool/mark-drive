/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// ---------- mock state ----------

const mockNavigate = vi.fn();
const mockSetTheme = vi.fn();
const mockSetLanguage = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFontFamily = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-icons/io5', () => {
  const stub = (name: string) => (props: any) => <span data-testid={`icon-${name}`} {...props} />;
  return {
    IoEllipsisHorizontal: stub('ellipsis'),
    IoInformationCircleOutline: stub('info'),
  };
});

vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    mode: 'light',
    setTheme: mockSetTheme,
  }),
}));

vi.mock('../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: mockSetLanguage,
    t: {
      settings: {
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        language: 'Language',
        english: 'English',
        japanese: 'Japanese',
      },
      fontSettings: {
        fontSize: 'Font Size',
        fontFamily: 'Font Family',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        system: 'System',
        serif: 'Serif',
        sansSerif: 'Sans-Serif',
      },
      home: {
        about: 'About MarkDrive',
      },
    },
  }),
}));

vi.mock('../../contexts/FontSettingsContext', () => ({
  useFontSettings: () => ({
    settings: { fontSize: 'medium', fontFamily: 'system' },
    setFontSize: mockSetFontSize,
    setFontFamily: mockSetFontFamily,
  }),
}));

// ---------- helpers ----------

import { SettingsMenu } from './SettingsMenu';

function openMenu() {
  fireEvent.click(screen.getByLabelText('Settings'));
}

beforeEach(() => {
  cleanup();
  mockNavigate.mockClear();
  mockSetTheme.mockClear();
  mockSetLanguage.mockClear();
  mockSetFontSize.mockClear();
  mockSetFontFamily.mockClear();
});

// ---------- tests ----------

describe('SettingsMenu', () => {
  it('renders trigger button', () => {
    render(<SettingsMenu />);
    expect(screen.getByLabelText('Settings')).toBeTruthy();
  });

  it('opens dropdown when trigger is clicked', () => {
    render(<SettingsMenu />);
    expect(screen.queryByText('Theme')).toBeNull();
    openMenu();
    expect(screen.getByText('Theme')).toBeTruthy();
  });

  it('closes dropdown when trigger is clicked again', () => {
    render(<SettingsMenu />);
    openMenu();
    expect(screen.getByText('Theme')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Settings'));
    expect(screen.queryByText('Theme')).toBeNull();
  });

  it('closes dropdown on Escape key', () => {
    render(<SettingsMenu />);
    openMenu();
    expect(screen.getByText('Theme')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Theme')).toBeNull();
  });
});

describe('SettingsMenu - Theme', () => {
  it('shows Light, Dark, System options', () => {
    render(<SettingsMenu />);
    openMenu();
    expect(screen.getByText('Light')).toBeTruthy();
    expect(screen.getByText('Dark')).toBeTruthy();
    // "System" appears in both theme and font family; just check it exists
    expect(screen.getAllByText('System').length).toBeGreaterThanOrEqual(1);
  });

  it('calls setTheme when clicking Dark', () => {
    render(<SettingsMenu />);
    openMenu();
    fireEvent.click(screen.getByText('Dark'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});

describe('SettingsMenu - Language', () => {
  it('shows English and Japanese options', () => {
    render(<SettingsMenu />);
    openMenu();
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('Japanese')).toBeTruthy();
  });

  it('calls setLanguage when clicking Japanese', () => {
    render(<SettingsMenu />);
    openMenu();
    fireEvent.click(screen.getByText('Japanese'));
    expect(mockSetLanguage).toHaveBeenCalledWith('ja');
  });
});

describe('SettingsMenu - Font settings (full variant)', () => {
  it('shows font size options in full variant', () => {
    render(<SettingsMenu variant="full" />);
    openMenu();
    expect(screen.getByText('Font Size')).toBeTruthy();
    expect(screen.getByText('Small')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Large')).toBeTruthy();
  });

  it('shows font family options in full variant', () => {
    render(<SettingsMenu variant="full" />);
    openMenu();
    expect(screen.getByText('Font Family')).toBeTruthy();
    expect(screen.getByText('Serif')).toBeTruthy();
    expect(screen.getByText('Sans-Serif')).toBeTruthy();
  });

  it('does not show font settings in basic variant', () => {
    render(<SettingsMenu variant="basic" />);
    openMenu();
    expect(screen.queryByText('Font Size')).toBeNull();
    expect(screen.queryByText('Font Family')).toBeNull();
  });

  it('calls setFontSize when clicking Small', () => {
    render(<SettingsMenu variant="full" />);
    openMenu();
    fireEvent.click(screen.getByText('Small'));
    expect(mockSetFontSize).toHaveBeenCalledWith('small');
  });

  it('calls setFontFamily when clicking Serif', () => {
    render(<SettingsMenu variant="full" />);
    openMenu();
    fireEvent.click(screen.getByText('Serif'));
    expect(mockSetFontFamily).toHaveBeenCalledWith('serif');
  });
});

describe('SettingsMenu - About link', () => {
  it('shows About MarkDrive link', () => {
    render(<SettingsMenu />);
    openMenu();
    expect(screen.getByText('About MarkDrive')).toBeTruthy();
  });

  it('navigates to /about when clicked', () => {
    render(<SettingsMenu />);
    openMenu();
    fireEvent.click(screen.getByText('About MarkDrive'));
    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });
});
