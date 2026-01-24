/**
 * English translations
 */

export const en = {
  // Home Screen
  home: {
    welcome: 'Welcome to MD Viewer',
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
    },
    signIn: 'Sign in with Google',
    or: 'or',
    openLocal: 'Open Local File',
    learnMore: 'Learn more about MD Viewer',
    searchPlaceholder: 'Search Google Drive...',
    recentFiles: 'Recent Files',
    clear: 'Clear',
    about: 'About MD Viewer',
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
  },

  // About Screen
  about: {
    title: 'About MD Viewer',
    appName: 'MD Viewer',
    version: 'Version {version}',
    whatIs: 'What is MD Viewer?',
    description:
      'MD Viewer is a web application that beautifully renders Markdown files stored in your Google Drive. It provides a seamless reading experience with syntax highlighting, diagram support, and PDF export capabilities.',
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
      'MD Viewer only requests read-only access to your Google Drive files. Your documents are never stored on our servers - they are fetched directly from Google Drive and rendered in your browser. Your authentication tokens are stored securely in your browser\'s local storage.',
    license: 'License',
    licenseDesc: 'MD Viewer is open source software released under the MIT License.',
    viewLicense: 'View License',
    thirdPartyLicenses: 'Third-Party Licenses',
    thirdPartyDesc: 'This application uses the following open source libraries.',
    viewThirdPartyLicenses: 'View Third-Party Licenses',
    footer: 'Built with Expo and React Native Web',
  },

  // Common
  common: {
    justNow: 'Just now',
    minutesAgo: '{min}m ago',
    hoursAgo: '{hours}h ago',
    daysAgo: '{days}d ago',
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
};

export type Translations = {
  home: {
    welcome: string;
    subtitle: string;
    feature: {
      drive: { title: string; desc: string };
      rendering: { title: string; desc: string };
      pdf: { title: string; desc: string };
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
    footer: string;
  };
  common: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
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
};
