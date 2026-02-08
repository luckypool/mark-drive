/**
 * MarkDrive - Third-Party Licenses Page
 */

import { useNavigate } from 'react-router';
import { IoArrowBack, IoOpenOutline } from 'react-icons/io5';
import { useLanguage } from '../hooks';
import { ThemeToggle, LanguageToggle } from '../components/ui';
import styles from './ThirdPartyLicensesPage.module.css';

interface LibraryInfo {
  name: string;
  version: string;
  license: string;
  url: string;
  author?: string;
}

const LIBRARIES: LibraryInfo[] = [
  {
    name: 'React',
    version: '19.1.0',
    license: 'MIT',
    url: 'https://github.com/facebook/react',
    author: 'Meta Platforms, Inc.',
  },
  {
    name: 'React Router',
    version: '7.6.1',
    license: 'MIT',
    url: 'https://github.com/remix-run/react-router',
    author: 'Remix Software',
  },
  {
    name: 'Vite',
    version: '6.3.5',
    license: 'MIT',
    url: 'https://github.com/vitejs/vite',
    author: 'Evan You',
  },
  {
    name: '@codemirror/view',
    version: '6.39.12',
    license: 'MIT',
    url: 'https://github.com/codemirror/view',
    author: 'Marijn Haverbeke',
  },
  {
    name: '@codemirror/state',
    version: '6.5.4',
    license: 'MIT',
    url: 'https://github.com/codemirror/state',
    author: 'Marijn Haverbeke',
  },
  {
    name: '@codemirror/lang-markdown',
    version: '6.5.0',
    license: 'MIT',
    url: 'https://github.com/codemirror/lang-markdown',
    author: 'Marijn Haverbeke',
  },
  {
    name: '@codemirror/commands',
    version: '6.10.2',
    license: 'MIT',
    url: 'https://github.com/codemirror/commands',
    author: 'Marijn Haverbeke',
  },
  {
    name: '@codemirror/search',
    version: '6.6.0',
    license: 'MIT',
    url: 'https://github.com/codemirror/search',
    author: 'Marijn Haverbeke',
  },
  {
    name: '@codemirror/language',
    version: '6.12.1',
    license: 'MIT',
    url: 'https://github.com/codemirror/language',
    author: 'Marijn Haverbeke',
  },
  {
    name: '@lezer/highlight',
    version: '1.2.3',
    license: 'MIT',
    url: 'https://github.com/lezer-parser/highlight',
    author: 'Marijn Haverbeke',
  },
  {
    name: 'react-markdown',
    version: '10.1.0',
    license: 'MIT',
    url: 'https://github.com/remarkjs/react-markdown',
    author: 'Espen Hovlandsdal',
  },
  {
    name: 'remark-gfm',
    version: '4.0.1',
    license: 'MIT',
    url: 'https://github.com/remarkjs/remark-gfm',
    author: 'Titus Wormer',
  },
  {
    name: 'react-syntax-highlighter',
    version: '16.1.0',
    license: 'MIT',
    url: 'https://github.com/react-syntax-highlighter/react-syntax-highlighter',
    author: 'Conor Hastings',
  },
  {
    name: 'Mermaid',
    version: '11.12.2',
    license: 'MIT',
    url: 'https://github.com/mermaid-js/mermaid',
    author: 'Knut Sveidqvist',
  },
  {
    name: 'html2pdf.js',
    version: '0.14.0',
    license: 'MIT',
    url: 'https://github.com/eKoopmans/html2pdf.js',
    author: 'Erik Koopmans',
  },
  {
    name: 'react-icons',
    version: '5.5.0',
    license: 'MIT',
    url: 'https://github.com/react-icons/react-icons',
    author: 'Goran Alkovic',
  },
];

export default function ThirdPartyLicensesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <IoArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>{t.about.thirdPartyLicenses}</span>
        <div className={styles.headerActions}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          <p className={styles.description}>
            {t.about.thirdPartyDesc}
          </p>

          <div className={styles.libraryList}>
            {LIBRARIES.map((lib) => (
              <div
                key={lib.name}
                className={styles.libraryCard}
                onClick={() => window.open(lib.url, '_blank')}
              >
                <div className={styles.libraryHeader}>
                  <span className={styles.libraryName}>{lib.name}</span>
                  <span className={styles.licenseBadge}>
                    <span className={styles.licenseText}>{lib.license}</span>
                  </span>
                </div>
                <p className={styles.libraryVersion}>v{lib.version}</p>
                {lib.author && (
                  <p className={styles.libraryAuthor}>{lib.author}</p>
                )}
                <div className={styles.linkRow}>
                  <IoOpenOutline size={14} />
                  <span className={styles.linkText}>View on GitHub</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.mitNotice}>
            <h3 className={styles.mitNoticeTitle}>MIT License</h3>
            <p className={styles.mitNoticeText}>
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
              {'\n\n'}
              The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
              {'\n\n'}
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
