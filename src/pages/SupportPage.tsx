/**
 * MarkDrive - Support / Contact Page
 */

import { useNavigate } from 'react-router';
import {
  IoArrowBack,
  IoLogoGithub,
  IoMailOutline,
  IoOpenOutline,
  IoChevronDown,
  IoChevronUp,
} from 'react-icons/io5';
import { useState } from 'react';
import { useLanguage } from '../hooks';
import { SettingsMenu } from '../components/ui';
import styles from './SupportPage.module.css';

const GITHUB_ISSUES_URL = 'https://github.com/luckypool/mark-drive/issues';
const CONTACT_EMAIL = 'founder@mark-drive.com';

export default function SupportPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (key: string) => {
    setOpenFaq((prev) => (prev === key ? null : key));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <IoArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>{t.support.title}</span>
        <div className={styles.headerActions}>
          <SettingsMenu variant="basic" />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          <div className={styles.card}>
            <p className={styles.intro}>{t.support.intro}</p>

            {/* Bug Reports & Feature Requests */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t.support.bugReport.title}</h3>
              <p className={styles.sectionBody}>{t.support.bugReport.desc}</p>
              <button
                className={styles.actionButton}
                onClick={() => window.open(GITHUB_ISSUES_URL, '_blank')}
              >
                <IoLogoGithub size={18} />
                <span>{t.support.bugReport.button}</span>
                <IoOpenOutline size={14} />
              </button>
            </div>

            {/* General Inquiries */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t.support.contact.title}</h3>
              <p className={styles.sectionBody}>{t.support.contact.desc}</p>
              <a
                className={styles.actionButton}
                href={`mailto:${CONTACT_EMAIL}`}
              >
                <IoMailOutline size={18} />
                <span>{t.support.contact.button}</span>
              </a>
            </div>

            {/* FAQ */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t.support.faq.title}</h3>
              <div className={styles.faqList}>
                {Object.entries(t.support.faq.items).map(([key, item]) => (
                  <div key={key} className={styles.faqItem}>
                    <button
                      className={styles.faqQuestion}
                      onClick={() => toggleFaq(key)}
                      aria-expanded={openFaq === key}
                    >
                      <span>{item.question}</span>
                      {openFaq === key ? (
                        <IoChevronUp size={18} />
                      ) : (
                        <IoChevronDown size={18} />
                      )}
                    </button>
                    {openFaq === key && (
                      <p className={styles.faqAnswer}>{item.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
