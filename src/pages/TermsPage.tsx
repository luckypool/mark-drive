/**
 * MarkDrive - Terms of Service Page
 */

import { useNavigate } from 'react-router';
import { IoArrowBack, IoLogoGithub, IoOpenOutline } from 'react-icons/io5';
import { useLanguage } from '../hooks';
import { ThemeToggle, LanguageToggle } from '../components/ui';
import styles from './TermsPage.module.css';

export default function TermsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const sections = t.legal.terms.sections;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <IoArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>{t.legal.terms.title}</span>
        <div className={styles.headerActions}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          <div className={styles.card}>
            <p className={styles.lastUpdated}>
              {t.legal.terms.lastUpdated}
            </p>

            {Object.entries(sections).map(([key, section]) => (
              <div key={key} className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  {section.title}
                </h3>
                <p className={styles.sectionBody}>
                  {section.body}
                </p>
                {'url' in section && section.url && (
                  <button
                    className={styles.contactLink}
                    onClick={() => window.open(section.url, '_blank')}
                  >
                    <IoLogoGithub size={16} />
                    <span>GitHub Issues</span>
                    <IoOpenOutline size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
