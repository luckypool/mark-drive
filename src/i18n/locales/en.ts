/**
 * English translations
 */

export const en = {
  // Home Screen
  home: {
    welcome: 'Welcome to MarkDrive',
    subtitle: 'A beautiful Markdown viewer for\nGoogle Drive',
    feature: {
      drive: {
        title: 'Google Drive Integration',
        desc: 'Search and open Markdown files directly from your Google Drive',
      },
      rendering: {
        title: 'Beautiful Rendering',
        desc: 'Syntax highlighting, Mermaid diagrams, and clean typography',
      },
      pdf: {
        title: 'Export to PDF',
        desc: 'Share your documents as beautifully formatted PDFs',
      },
      syntax: {
        title: 'Syntax Highlighting',
        desc: 'Code blocks with highlighting for all major programming languages',
      },
      mermaid: {
        title: 'Mermaid Diagrams',
        desc: 'Flowcharts, sequence diagrams, and more rendered automatically',
      },
      local: {
        title: 'Local File Support',
        desc: 'Open Markdown files from your device without signing in',
      },
    },
    tagline: 'Free. Open source. No server storage.',
    previewTitle: 'See it in action',
    previewCaption: 'Dark and light themes supported',
    howItWorks: {
      title: 'How it Works',
      step1: {
        title: 'Connect',
        desc: 'Sign in with your Google account in one click',
      },
      step2: {
        title: 'Browse',
        desc: 'Search and find Markdown files in your Drive',
      },
      step3: {
        title: 'View',
        desc: 'Enjoy beautifully rendered documents instantly',
      },
    },
    featuresTitle: 'Everything you need',
    techTitle: 'Built with modern technology',
    stats: {
      clientSide: { value: '100%', label: 'Client-side' },
      serverStorage: { value: '0', label: 'Server storage' },
      license: { value: 'MIT', label: 'License' },
    },
    benefitsTitle: 'Why MarkDrive?',
    benefit: {
      privacy: {
        title: 'Privacy First',
        desc: 'Your files never leave your browser. No server storage, no tracking of your documents.',
      },
      instant: {
        title: 'Instant Access',
        desc: 'No downloads or installs needed. Open any Markdown file directly from Google Drive.',
      },
      beautiful: {
        title: 'Beautiful Output',
        desc: 'Professional rendering with syntax highlighting, diagrams, and PDF export.',
      },
    },
    closingCta: {
      title: 'Ready to get started?',
      subtitle: 'View your Google Drive Markdown files beautifully — free and private.',
    },
    footer: {
      builtWith: 'Built with Expo and React Native Web',
      viewOnGithub: 'View on GitHub',
    },
    signIn: 'Sign in with Google',
    or: 'or',
    openLocal: 'Open Local File',
    learnMore: 'Learn more about MarkDrive',
    searchPlaceholder: 'Search Google Drive...',
    recentFiles: 'Recent Files',
    clear: 'Clear',
    about: 'About MarkDrive',
    signOut: 'Sign Out',
  },

  // Viewer Screen
  viewer: {
    loading: 'Loading...',
    retry: 'Retry',
    noContent: 'No content',
    authRequired: 'Authentication required. Please go back to home and sign in.',
    loadFailed: 'Failed to load file',
    errorOccurred: 'An error occurred',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    edit: 'Edit',
    preview: 'Preview',
    saving: 'Saving...',
    saved: 'Saved',
    saveFailed: 'Failed to save',
    unsavedChanges: 'You have unsaved changes. Discard them?',
    save: 'Save',
    reauthRequired: 'Please sign out and sign in again to enable editing',
    linesCount: '{lines} lines',
    charsCount: '{chars} chars',
    unsavedLabel: 'Unsaved changes',
  },

  // Search Screen
  search: {
    placeholder: 'Search Google Drive...',
    signInPrompt: 'Please sign in to search\nGoogle Drive',
    signIn: 'Sign in with Google',
    emptyTitle: 'Search Markdown Files',
    emptyHint: 'Type at least 2 characters to start searching',
    minChars: 'Type at least 2 characters',
    noResults: 'No Results Found',
    noResultsHint: 'Try searching with different keywords',
    resultCount: '{count} result',
    resultsCount: '{count} results',
    privacyTitle: 'Your Privacy Matters',
    privacyDesc: 'Files are fetched directly from Google Drive and rendered in your browser. Nothing is stored on our servers.',
    recentTitle: 'Recent Files',
    recentHint: 'Showing recently modified Markdown files',
    noRecentFiles: 'No Markdown files found',
  },

  // About Screen
  about: {
    title: 'About MarkDrive',
    appName: 'MarkDrive',
    version: 'Version {version}',
    whatIs: 'What is MarkDrive?',
    description:
      'MarkDrive is a web application that beautifully renders Markdown files stored in your Google Drive. It provides a seamless reading experience with syntax highlighting, diagram support, and PDF export capabilities.',
    features: 'Features',
    feature: {
      drive: {
        title: 'Google Drive Integration',
        desc: 'Connect your Google account and search for Markdown files directly from your Drive. Quick access to your documents without downloading.',
      },
      syntax: {
        title: 'Syntax Highlighting',
        desc: 'Code blocks are rendered with syntax highlighting for various programming languages including JavaScript, Python, TypeScript, and more.',
      },
      mermaid: {
        title: 'Mermaid Diagrams',
        desc: 'Create flowcharts, sequence diagrams, and other visualizations using Mermaid syntax. Diagrams are rendered automatically within your documents.',
      },
      pdf: {
        title: 'PDF Export',
        desc: 'Export your rendered Markdown documents as PDF files. Perfect for sharing documentation or creating printable versions of your notes.',
      },
      local: {
        title: 'Local File Support',
        desc: 'Open Markdown files from your local device without signing in. Great for quick previews or when working offline.',
      },
      recent: {
        title: 'Recent Files',
        desc: 'Quick access to recently viewed files. Your reading history is stored locally for convenience.',
      },
    },
    supported: 'Supported Markdown Features',
    chips: {
      headers: 'Headers',
      boldItalic: 'Bold / Italic',
      lists: 'Lists',
      tables: 'Tables',
      codeBlocks: 'Code Blocks',
      links: 'Links',
      images: 'Images',
      blockquotes: 'Blockquotes',
      taskLists: 'Task Lists',
      strikethrough: 'Strikethrough',
      mermaid: 'Mermaid',
      gfm: 'GFM',
    },
    privacy: 'Privacy & Security',
    privacyDesc:
      'MarkDrive only requests read-only access to your Google Drive files. Your documents are never stored on our servers - they are fetched directly from Google Drive and rendered in your browser. We use Google Analytics to collect anonymous usage data for service improvement.',
    license: 'License',
    licenseDesc: 'MarkDrive is open source software released under the MIT License.',
    viewLicense: 'View License',
    thirdPartyLicenses: 'Third-Party Licenses',
    thirdPartyDesc: 'This application uses the following open source libraries.',
    viewThirdPartyLicenses: 'View Third-Party Licenses',
    viewTerms: 'Terms of Service',
    viewPrivacy: 'Privacy Policy',
    footer: 'Built with Expo and React Native Web',
  },

  // Common
  common: {
    justNow: 'Just now',
    minutesAgo: '{min}m ago',
    hoursAgo: '{hours}h ago',
    daysAgo: '{days}d ago',
  },

  // Settings Menu
  settings: {
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
  },

  // Font Settings
  fontSettings: {
    title: 'Display Settings',
    fontSize: 'Font Size',
    fontFamily: 'Font Family',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    system: 'System',
    serif: 'Serif',
    sansSerif: 'Sans-serif',
    preview: 'Preview',
    previewText: 'The quick brown fox jumps over the lazy dog.',
  },

  // Menu
  menu: {
    title: 'Menu',
    account: 'Account',
    display: 'Display Settings',
  },

  // File Info
  fileInfo: {
    title: 'File Info',
    source: 'Source',
    googleDrive: 'Google Drive',
    local: 'Local File',
    exportPdf: 'Export PDF',
  },

  // Add to Home Screen
  addToHomeScreen: {
    title: 'Add to Home Screen',
    description: 'Install MarkDrive for quick access',
    instruction: 'Tap {shareIcon} then "Add to Home Screen"',
    dismiss: 'Not now',
  },

  // Legal
  legal: {
    terms: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: January 2025',
      sections: {
        acceptance: {
          title: '1. Acceptance of Terms',
          body: 'By accessing or using MarkDrive ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.',
        },
        description: {
          title: '2. Description of Service',
          body: 'MarkDrive is a web-based Markdown file viewer that renders Markdown files stored in Google Drive or on your local device. The Service operates entirely within your browser and does not store any of your files or data on external servers.',
        },
        googleApi: {
          title: '3. Google API Usage',
          body: 'The Service uses the Google Drive API to access your Markdown files with read-only permission (drive.readonly scope). By using the Google Drive integration, you also agree to Google\'s Terms of Service. The Service only requests the minimum permissions necessary to function.',
        },
        intellectual: {
          title: '4. Intellectual Property',
          body: 'MarkDrive is open source software released under the MIT License. Your files and content remain your own property. The Service does not claim any ownership over content you view through it.',
        },
        disclaimer: {
          title: '5. Disclaimer of Warranties',
          body: 'The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or free of harmful components. Use of the Service is at your own risk.',
        },
        changes: {
          title: '6. Changes to Terms',
          body: 'We reserve the right to modify these Terms of Service at any time. Changes will be reflected by updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the modified terms.',
        },
        contact: {
          title: '7. Contact',
          body: 'For questions about these Terms of Service, please visit the project\'s GitHub repository.',
          url: 'https://github.com/luckypool/mark-drive/issues',
        },
      },
    },
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: January 2025',
      sections: {
        intro: {
          title: '1. Introduction',
          body: 'This Privacy Policy explains how MarkDrive ("the Service") handles your information. We are committed to protecting your privacy and being transparent about our data practices.',
        },
        collect: {
          title: '2. Information We Store',
          body: 'The following data is stored locally in your browser\'s localStorage:\n\n• Google OAuth authentication token (for Google Drive access)\n• Theme preference (light/dark)\n• Font settings (size and family)\n• Language preference (English/Japanese)\n• Recently viewed file history',
        },
        notCollect: {
          title: '3. Information We Do Not Collect',
          body: 'We do not collect, store, or transmit:\n\n• Contents of your Markdown files\n• Personal information or profile data\n• Google Drive file names or file IDs\n\nHowever, we use Google Analytics to collect anonymous usage data such as page views, approximate geographic location, and device/browser type for service improvement.',
        },
        google: {
          title: '4. Google API Usage',
          body: 'The Service uses the Google Drive API with read-only access (drive.readonly scope). This allows the Service to search for and read Markdown files from your Google Drive. File contents are fetched directly from Google Drive to your browser and are never sent to any other server.',
        },
        storage: {
          title: '5. Data Storage',
          body: 'User preferences and settings are stored exclusively in your browser\'s localStorage. You can clear all stored data at any time by clearing your browser\'s local storage or signing out of the Service. Google Analytics uses cookies for usage analysis. You can delete or disable cookies through your browser settings.',
        },
        thirdParty: {
          title: '6. Third-Party Services',
          body: 'The Service integrates with Google Drive API for file access. When you sign in with Google, your authentication is handled directly by Google\'s Identity Services. We also use Google Analytics to collect anonymous usage data for service improvement. To opt out of Google Analytics, you can use the Google Analytics Opt-out Browser Add-on. We recommend reviewing Google\'s Privacy Policy for information about how Google handles your data.',
        },
        children: {
          title: '7. Children\'s Privacy',
          body: 'The Service is not directed at children under the age of 13. We do not knowingly collect information from children under 13.',
        },
        changes: {
          title: '8. Changes to This Policy',
          body: 'We may update this Privacy Policy from time to time. Changes will be reflected by updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.',
        },
        contact: {
          title: '9. Contact',
          body: 'For questions about this Privacy Policy, please visit the project\'s GitHub repository.',
          url: 'https://github.com/luckypool/mark-drive/issues',
        },
      },
    },
  },
};

export type Translations = {
  home: {
    welcome: string;
    subtitle: string;
    feature: {
      drive: { title: string; desc: string };
      rendering: { title: string; desc: string };
      pdf: { title: string; desc: string };
      syntax: { title: string; desc: string };
      mermaid: { title: string; desc: string };
      local: { title: string; desc: string };
    };
    tagline: string;
    previewTitle: string;
    previewCaption: string;
    howItWorks: {
      title: string;
      step1: { title: string; desc: string };
      step2: { title: string; desc: string };
      step3: { title: string; desc: string };
    };
    featuresTitle: string;
    techTitle: string;
    stats: {
      clientSide: { value: string; label: string };
      serverStorage: { value: string; label: string };
      license: { value: string; label: string };
    };
    benefitsTitle: string;
    benefit: {
      privacy: { title: string; desc: string };
      instant: { title: string; desc: string };
      beautiful: { title: string; desc: string };
    };
    closingCta: {
      title: string;
      subtitle: string;
    };
    footer: {
      builtWith: string;
      viewOnGithub: string;
    };
    signIn: string;
    or: string;
    openLocal: string;
    learnMore: string;
    searchPlaceholder: string;
    recentFiles: string;
    clear: string;
    about: string;
    signOut: string;
  };
  viewer: {
    loading: string;
    retry: string;
    noContent: string;
    authRequired: string;
    loadFailed: string;
    errorOccurred: string;
    fullscreen: string;
    exitFullscreen: string;
    edit: string;
    preview: string;
    saving: string;
    saved: string;
    saveFailed: string;
    unsavedChanges: string;
    save: string;
    reauthRequired: string;
    linesCount: string;
    charsCount: string;
    unsavedLabel: string;
  };
  search: {
    placeholder: string;
    signInPrompt: string;
    signIn: string;
    emptyTitle: string;
    emptyHint: string;
    minChars: string;
    noResults: string;
    noResultsHint: string;
    resultCount: string;
    resultsCount: string;
    privacyTitle: string;
    privacyDesc: string;
    recentTitle: string;
    recentHint: string;
    noRecentFiles: string;
  };
  about: {
    title: string;
    appName: string;
    version: string;
    whatIs: string;
    description: string;
    features: string;
    feature: {
      drive: { title: string; desc: string };
      syntax: { title: string; desc: string };
      mermaid: { title: string; desc: string };
      pdf: { title: string; desc: string };
      local: { title: string; desc: string };
      recent: { title: string; desc: string };
    };
    supported: string;
    chips: {
      headers: string;
      boldItalic: string;
      lists: string;
      tables: string;
      codeBlocks: string;
      links: string;
      images: string;
      blockquotes: string;
      taskLists: string;
      strikethrough: string;
      mermaid: string;
      gfm: string;
    };
    privacy: string;
    privacyDesc: string;
    license: string;
    licenseDesc: string;
    viewLicense: string;
    thirdPartyLicenses: string;
    thirdPartyDesc: string;
    viewThirdPartyLicenses: string;
    viewTerms: string;
    viewPrivacy: string;
    footer: string;
  };
  common: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };
  settings: {
    theme: string;
    light: string;
    dark: string;
    system: string;
    language: string;
  };
  fontSettings: {
    title: string;
    fontSize: string;
    fontFamily: string;
    small: string;
    medium: string;
    large: string;
    system: string;
    serif: string;
    sansSerif: string;
    preview: string;
    previewText: string;
  };
  menu: {
    title: string;
    account: string;
    display: string;
  };
  fileInfo: {
    title: string;
    source: string;
    googleDrive: string;
    local: string;
    exportPdf: string;
  };
  addToHomeScreen: {
    title: string;
    description: string;
    instruction: string;
    dismiss: string;
  };
  legal: {
    terms: {
      title: string;
      lastUpdated: string;
      sections: {
        acceptance: { title: string; body: string };
        description: { title: string; body: string };
        googleApi: { title: string; body: string };
        intellectual: { title: string; body: string };
        disclaimer: { title: string; body: string };
        changes: { title: string; body: string };
        contact: { title: string; body: string; url: string };
      };
    };
    privacy: {
      title: string;
      lastUpdated: string;
      sections: {
        intro: { title: string; body: string };
        collect: { title: string; body: string };
        notCollect: { title: string; body: string };
        google: { title: string; body: string };
        storage: { title: string; body: string };
        thirdParty: { title: string; body: string };
        children: { title: string; body: string };
        changes: { title: string; body: string };
        contact: { title: string; body: string; url: string };
      };
    };
  };
};
