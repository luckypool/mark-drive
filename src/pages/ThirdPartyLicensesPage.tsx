/**
 * MarkDrive - Third-Party Licenses Page
 *
 * Fetches and displays the auto-generated third-party-licenses.txt
 * produced by generate-license-file.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { IoArrowBack, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useLanguage } from '../hooks';
import { SettingsMenu } from '../components/ui';
import styles from './ThirdPartyLicensesPage.module.css';

interface LicenseGroup {
  packages: string[];
  licenseText: string;
}

function parseLicenseFile(text: string): LicenseGroup[] {
  // Skip the header (first 2 lines + blank)
  const headerEnd = text.indexOf('\n\n');
  const body = headerEnd >= 0 ? text.slice(headerEnd + 2) : text;

  const sections = body.split('\n-----------\n');
  const groups: LicenseGroup[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Extract package names: lines starting with " - "
    const packages: string[] = [];
    const lines = trimmed.split('\n');
    let licenseStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith(' - ')) {
        packages.push(line.slice(3).trim());
      } else if (
        line.startsWith('This package contains the following license:') ||
        line.startsWith('These packages each contain the following license:')
      ) {
        licenseStartIndex = i + 1;
        break;
      }
    }

    if (packages.length === 0) continue;

    const licenseText = lines.slice(licenseStartIndex).join('\n').trim();
    groups.push({ packages, licenseText });
  }

  return groups;
}

function LicenseSection({ group }: { group: LicenseGroup }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.licenseSection}>
      <button
        className={styles.sectionHeader}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={styles.packageList}>
          {group.packages.map((pkg) => (
            <span key={pkg} className={styles.packageBadge}>
              {pkg}
            </span>
          ))}
        </div>
        <span className={styles.expandIcon}>
          {expanded ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
        </span>
      </button>
      {expanded && (
        <pre className={styles.licenseText}>{group.licenseText}</pre>
      )}
    </div>
  );
}

export default function ThirdPartyLicensesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<LicenseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/third-party-licenses.txt')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        setGroups(parseLicenseFile(text));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const totalPackages = groups.reduce((sum, g) => sum + g.packages.length, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <IoArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>{t.about.thirdPartyLicenses}</span>
        <div className={styles.headerActions}>
          <SettingsMenu variant="basic" />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          <p className={styles.description}>
            {t.about.thirdPartyDesc}
          </p>

          {loading && (
            <p className={styles.statusText}>Loading...</p>
          )}

          {error && (
            <p className={styles.statusText}>Error: {error}</p>
          )}

          {!loading && !error && (
            <>
              <p className={styles.summaryText}>
                {totalPackages} packages / {groups.length} licenses
              </p>
              <div className={styles.licenseList}>
                {groups.map((group, i) => (
                  <LicenseSection key={i} group={group} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
