/**
 * MarkDrive - Privacy Policy Page
 */

import { useNavigate } from 'react-router';
import { IoArrowBack, IoLogoGithub, IoOpenOutline } from 'react-icons/io5';
import { useLanguage } from '../hooks';
import { SettingsMenu } from '../components/ui';
import styles from './PrivacyPage.module.css';

export default function PrivacyPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const sections = t.legal.privacy.sections;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <IoArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>{t.legal.privacy.title}</span>
        <div className={styles.headerActions}>
          <SettingsMenu variant="basic" />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          <div className={styles.card}>
            <p className={styles.lastUpdated}>
              {t.legal.privacy.lastUpdated}
            </p>

            {Object.entries(sections).map(([key, section]) => {
              const paragraphs = section.body.split('\n\n');
              const items = 'items' in section ? (section.items as string[]) : undefined;

              return (
                <div key={key} className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    {section.title}
                  </h3>
                  <p className={styles.sectionBody}>
                    {paragraphs[0]}
                  </p>
                  {items && (
                    <ul className={styles.sectionList}>
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {paragraphs.slice(1).map((p, i) => (
                    <p key={i} className={styles.sectionBody}>
                      {p}
                    </p>
                  ))}
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
