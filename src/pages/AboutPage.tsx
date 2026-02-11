/**
 * MarkDrive - About Page
 */

import { useNavigate } from 'react-router';
import {
  IoArrowBack,
  IoLogoGoogle,
  IoCodeSlashOutline,
  IoGitNetworkOutline,
  IoDocumentOutline,
  IoFolderOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoLibraryOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
} from 'react-icons/io5';
import { useLanguage } from '../hooks';
import { SettingsMenu } from '../components/ui';
import iconImage from '../../assets/images/icon.png';
import styles from './AboutPage.module.css';

const FEATURES = [
  { icon: IoLogoGoogle, key: 'drive' },
  { icon: IoCodeSlashOutline, key: 'syntax' },
  { icon: IoGitNetworkOutline, key: 'mermaid' },
  { icon: IoDocumentOutline, key: 'pdf' },
  { icon: IoFolderOutline, key: 'local' },
  { icon: IoTimeOutline, key: 'recent' },
] as const;

export default function AboutPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <IoArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>{t.about.title}</span>
        <div className={styles.headerActions}>
          <SettingsMenu variant="basic" />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          {/* Hero */}
          <div className={styles.hero}>
            <img src={iconImage} alt="MarkDrive" className={styles.heroIcon} />
            <h1 className={styles.heroTitle}>{t.about.appName}</h1>
            <span className={styles.heroVersion}>{t.about.version.replace('{version}', '2.0.0')}</span>
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.about.whatIs}</h2>
            <p className={styles.sectionText}>{t.about.description}</p>
          </div>

          {/* Features */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.about.features}</h2>
            <div className={styles.featureList}>
              {FEATURES.map(({ icon: Icon, key }) => (
                <div key={key} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.featureContent}>
                    <h3 className={styles.featureTitle}>
                      {t.about.feature[key].title}
                    </h3>
                    <p className={styles.featureDescription}>
                      {t.about.feature[key].desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Formats */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.about.supported}</h2>
            <div className={styles.chipContainer}>
              {[
                t.about.chips.headers,
                t.about.chips.boldItalic,
                t.about.chips.lists,
                t.about.chips.tables,
                t.about.chips.codeBlocks,
                t.about.chips.links,
                t.about.chips.images,
                t.about.chips.blockquotes,
                t.about.chips.taskLists,
                t.about.chips.strikethrough,
                t.about.chips.mermaid,
                t.about.chips.gfm,
              ].map((label) => (
                <span key={label} className={styles.chip}>
                  <span className={styles.chipText}>{label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.about.privacy}</h2>
            <p className={styles.sectionText}>{t.about.privacyDesc}</p>
          </div>

          {/* License */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.about.license}</h2>
            <p className={styles.sectionText}>{t.about.licenseDesc}</p>
            <div className={styles.licenseButtons}>
              <button className={styles.licenseButton} onClick={() => navigate('/license')}>
                <IoDocumentTextOutline size={18} />
                <span>{t.about.viewLicense}</span>
              </button>
              <button className={styles.licenseButton} onClick={() => navigate('/third-party-licenses')}>
                <IoLibraryOutline size={18} />
                <span>{t.about.viewThirdPartyLicenses}</span>
              </button>
              <button className={styles.licenseButton} onClick={() => navigate('/terms')}>
                <IoShieldCheckmarkOutline size={18} />
                <span>{t.about.viewTerms}</span>
              </button>
              <button className={styles.licenseButton} onClick={() => navigate('/privacy')}>
                <IoLockClosedOutline size={18} />
                <span>{t.about.viewPrivacy}</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <span className={styles.footerText}>{t.about.footer}</span>
            <span className={styles.footerTrademark}>{t.home.footer.trademark}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
