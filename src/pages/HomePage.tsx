/**
 * MarkDrive - Home Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  IoShieldCheckmarkOutline,
  IoCodeSlashOutline,
  IoGitNetworkOutline,
  IoLogoGoogle,
  IoColorPaletteOutline,
  IoShareOutline,
  IoFolderOutline,
  IoFlashOutline,
  IoDocumentTextOutline,
  IoLogInOutline,
  IoSearchOutline,
  IoEyeOutline,
  IoChevronForward,
  IoChevronDown,
  IoDocumentOutline,
  IoLogoGithub,
  IoSettingsOutline,
  IoPlayOutline,
} from 'react-icons/io5';
import { Button, LoadingSpinner, FAB, SettingsMenu, UserMenu, GoogleLogo } from '../components/ui';
import { AddToHomeScreenBanner } from '../components/ui/AddToHomeScreenBanner';
import { useGoogleAuth, useTheme, useLanguage, usePickerSettings } from '../hooks';
import { useFilePicker } from '../hooks';
import { getFileHistory, clearFileHistory, addFileToHistory } from '../services';
import type { FileHistoryItem } from '../types';
import sampleMd from '../../docs/markdrive-sample.md?raw';
import iconImage from '../../assets/images/icon.png';
import { trackEvent } from '../utils/analytics';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { resolvedMode } = useTheme();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 768;
  const {
    isLoading,
    isApiLoaded,
    isAuthenticated,
    userInfo,
    authenticate,
    logout,
    openDrivePicker,
  } = useGoogleAuth();

  const { openPicker } = useFilePicker();
  const { pickerSettings, updatePickerSettings } = usePickerSettings();
  const [recentFiles, setRecentFiles] = useState<FileHistoryItem[]>([]);
  const [isPickerSettingsOpen, setIsPickerSettingsOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await getFileHistory();
    setRecentFiles(history.filter((item) => item.source !== 'local'));
  };

  const handleTryNow = useCallback(() => {
    trackEvent('try_now_click');
    navigate('/viewer', {
      state: {
        id: 'sample-markdrive',
        name: 'markdrive-sample.md',
        content: sampleMd,
        source: 'local',
      },
    });
  }, [navigate]);

  const handleLocalFile = useCallback(async () => {
    const file = await openPicker();
    if (file) {
      await addFileToHistory({
        id: file.id,
        name: file.name,
        source: 'local',
      });
      trackEvent('open_local_file');
      const params = new URLSearchParams({
        id: file.id,
        name: file.name,
        content: file.content,
        source: 'local',
      });
      navigate(`/viewer?${params.toString()}`);
    }
  }, [openPicker, navigate]);

  const handleOpenDrivePicker = useCallback(async () => {
    const result = await openDrivePicker({ settings: pickerSettings, locale: language });
    if (result) {
      trackEvent('open_drive_file', { source: 'picker' });
      const params = new URLSearchParams({
        id: result.id,
        name: result.name,
        source: 'google-drive',
      });
      navigate(`/viewer?${params.toString()}`);
    }
  }, [openDrivePicker, pickerSettings, language, navigate]);

  // Keyboard shortcut: Cmd+K to open Drive Picker
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpenDrivePicker();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, handleOpenDrivePicker]);

  const handleOpenHistoryFile = useCallback((item: FileHistoryItem) => {
    const params = new URLSearchParams({
      id: item.id,
      name: item.name,
      source: item.source,
    });
    navigate(`/viewer?${params.toString()}`);
  }, [navigate]);

  const handleClearHistory = useCallback(async () => {
    await clearFileHistory();
    setRecentFiles([]);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t.common.justNow;
    if (minutes < 60) return t.common.minutesAgo.replace('{min}', String(minutes));
    if (hours < 24) return t.common.hoursAgo.replace('{hours}', String(hours));
    if (days < 7) return t.common.daysAgo.replace('{days}', String(days));
    return date.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US');
  };

  type StepIconName = 'log-in-outline' | 'search-outline' | 'eye-outline';
  const stepIconMap: Record<StepIconName, React.ComponentType<{ size?: number }>> = {
    'log-in-outline': IoLogInOutline,
    'search-outline': IoSearchOutline,
    'eye-outline': IoEyeOutline,
  };

  type FeatureIconName = 'logo-google' | 'color-palette-outline' | 'share-outline' | 'code-slash-outline' | 'git-network-outline' | 'folder-outline';
  const featureIconMap: Record<FeatureIconName, React.ComponentType<{ size?: number }>> = {
    'logo-google': IoLogoGoogle,
    'color-palette-outline': IoColorPaletteOutline,
    'share-outline': IoShareOutline,
    'code-slash-outline': IoCodeSlashOutline,
    'git-network-outline': IoGitNetworkOutline,
    'folder-outline': IoFolderOutline,
  };

  type BenefitIconName = 'shield-checkmark-outline' | 'flash-outline' | 'document-text-outline';
  const benefitIconMap: Record<BenefitIconName, React.ComponentType<{ size?: number }>> = {
    'shield-checkmark-outline': IoShieldCheckmarkOutline,
    'flash-outline': IoFlashOutline,
    'document-text-outline': IoDocumentTextOutline,
  };

  type ChipIconName = 'shield-checkmark-outline' | 'code-slash-outline' | 'git-network-outline';
  const chipIconMap: Record<ChipIconName, React.ComponentType<{ size?: number }>> = {
    'shield-checkmark-outline': IoShieldCheckmarkOutline,
    'code-slash-outline': IoCodeSlashOutline,
    'git-network-outline': IoGitNetworkOutline,
  };

  return (
    <div className={styles.container}>
      {/* Landing Header - Settings bar for non-authenticated users */}
      {!isAuthenticated && (
        <div className={styles.landingHeader}>
          <div className={styles.headerBrand}>
            <img src={iconImage} alt="MarkDrive" className={styles.headerLogo} />
            <span className={styles.headerAppName}>MarkDrive</span>
          </div>
          <div className={styles.headerActions}>
            <UserMenu
              isAuthenticated={false}
              userInfo={null}
              onSignIn={authenticate}
              onSignOut={logout}
            />
            <SettingsMenu variant="full" />
          </div>
        </div>
      )}

      {/* Header - Only shown when authenticated */}
      {isAuthenticated && (
        <div className={styles.header}>
          <div className={styles.headerActions}>
            <UserMenu
              isAuthenticated={true}
              userInfo={userInfo}
              onSignIn={authenticate}
              onSignOut={handleLogout}
            />
            <SettingsMenu variant="full" />
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          {/* Landing Page for Non-authenticated Users */}
          {!isAuthenticated ? (
            <div className={styles.landingContainer}>
              {/* Section 1: Hero + Preview */}
              <div className={styles.heroRow}>
                {/* Left: Text content */}
                <div className={styles.heroLeft}>
                  <h1 className={styles.heroTitle}>
                    {t.home.welcomeLine1}
                    <br />
                    <span className={styles.heroHighlight}>{t.home.welcomeHighlight}</span>
                    <br />
                    {t.home.welcomeLine2}
                  </h1>
                  <p className={styles.heroSubtitle}>
                    {t.home.subtitle}
                  </p>
                  <p className={styles.heroTagline}>
                    {t.home.tagline}
                  </p>

                  {/* Feature Badges */}
                  <div className={styles.techChips}>
                    {([
                      { label: t.home.benefit.privacy.title, icon: 'shield-checkmark-outline' as ChipIconName },
                      { label: t.home.feature.syntax.title, icon: 'code-slash-outline' as ChipIconName },
                      { label: 'Mermaid', icon: 'git-network-outline' as ChipIconName },
                    ]).map((chip) => {
                      const IconComp = chipIconMap[chip.icon];
                      return (
                        <div key={chip.label} className={styles.techChip}>
                          <IconComp size={12} />
                          <span className={styles.techChipText}>{chip.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    onPress={authenticate}
                    disabled={!isApiLoaded}
                    loading={isLoading}
                    size="lg"
                    variant="secondary"
                    style={{
                      marginTop: 32,
                      backgroundColor: '#ffffff',
                      borderColor: '#dadce0',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      ...(isDesktop ? { alignSelf: 'flex-start' } : {}),
                    }}
                    textStyle={{
                      color: '#3c4043',
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                    icon={<GoogleLogo size={20} />}
                  >
                    {t.home.signIn}
                  </Button>
                  <button
                    className={styles.tryNowLink}
                    onClick={handleTryNow}
                    type="button"
                  >
                    <IoPlayOutline size={16} />
                    <span>{t.home.tryNow}</span>
                  </button>
                </div>

                {/* Right: Preview image with crossfade animation */}
                <div className={styles.heroRight}>
                  {isDesktop ? (
                    <div className={styles.previewContainer}>
                      <div className={styles.previewImageWrapper}>
                        <img
                          src={resolvedMode === 'dark' ? '/app-preview.svg' : '/app-preview-light.svg'}
                          alt="MarkDrive Preview"
                          className={`${styles.previewImage} ${styles.previewImageDesktop}`}
                        />
                        <img
                          src={resolvedMode === 'dark' ? '/app-preview-raw.svg' : '/app-preview-raw-light.svg'}
                          alt="MarkDrive Raw Markdown"
                          className={`${styles.previewImageOverlay} ${styles.previewImageOverlayDesktop}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={styles.previewContainerMobile}>
                      <div className={styles.previewImageWrapper}>
                        <img
                          src={resolvedMode === 'dark' ? '/app-preview-mobile.svg' : '/app-preview-mobile-light.svg'}
                          alt="MarkDrive Mobile Preview"
                          className={styles.previewImage}
                        />
                        <img
                          src={resolvedMode === 'dark' ? '/app-preview-mobile-raw.svg' : '/app-preview-mobile-raw-light.svg'}
                          alt="MarkDrive Raw Markdown"
                          className={styles.previewImageOverlay}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: How it Works */}
              <div className={styles.howItWorksSection}>
                <h2 className={styles.sectionTitle}>
                  {t.home.howItWorks.title}
                </h2>
                <div className={styles.stepsRow}>
                  {([
                    { step: t.home.howItWorks.step1, icon: 'log-in-outline' as StepIconName, num: '1' },
                    { step: t.home.howItWorks.step2, icon: 'search-outline' as StepIconName, num: '2' },
                    { step: t.home.howItWorks.step3, icon: 'eye-outline' as StepIconName, num: '3' },
                  ]).map((item, index) => {
                    const IconComp = stepIconMap[item.icon];
                    return (
                      <React.Fragment key={item.num}>
                        {index > 0 && (
                          <>
                            <div className={styles.stepArrow}>
                              <IoChevronForward size={20} />
                            </div>
                            <div className={styles.stepChevron}>
                              <IoChevronDown size={20} />
                            </div>
                          </>
                        )}
                        <div className={styles.stepCard}>
                          <div className={styles.stepIconWrap}>
                            <IconComp size={28} />
                          </div>
                          <h3 className={styles.stepTitle}>
                            {item.step.title}
                          </h3>
                          <p className={styles.stepDesc}>
                            {item.step.desc}
                          </p>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Features (6 items, 2-column grid) */}
              <div className={styles.featuresSection}>
                <h2 className={styles.sectionTitle}>
                  {t.home.featuresTitle}
                </h2>
                <div className={styles.featuresGrid}>
                  {([
                    { title: t.home.feature.drive.title, desc: t.home.feature.drive.desc, icon: 'logo-google' as FeatureIconName },
                    { title: t.home.feature.rendering.title, desc: t.home.feature.rendering.desc, icon: 'color-palette-outline' as FeatureIconName },
                    { title: t.home.feature.pdf.title, desc: t.home.feature.pdf.desc, icon: 'share-outline' as FeatureIconName },
                    { title: t.home.feature.syntax.title, desc: t.home.feature.syntax.desc, icon: 'code-slash-outline' as FeatureIconName },
                    { title: t.home.feature.mermaid.title, desc: t.home.feature.mermaid.desc, icon: 'git-network-outline' as FeatureIconName },
                    { title: t.home.feature.local.title, desc: t.home.feature.local.desc, icon: 'folder-outline' as FeatureIconName },
                  ]).map((feature) => {
                    const IconComp = featureIconMap[feature.icon];
                    return (
                      <div
                        key={feature.title}
                        className={styles.featureCardVertical}
                      >
                        <div className={styles.featureIconContainer}>
                          <IconComp size={24} />
                        </div>
                        <h3 className={styles.featureTitle}>{feature.title}</h3>
                        <p className={styles.featureDescription}>
                          {feature.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: Stats */}
              <div className={styles.techSection}>
                <h2 className={styles.sectionTitle}>
                  {t.home.techTitle.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
                </h2>
                <div className={styles.statsRow}>
                  {([
                    t.home.stats.clientSide,
                    t.home.stats.serverStorage,
                  ]).map((stat) => (
                    <div key={stat.label} className={styles.statItem}>
                      <span className={styles.statValue}>{stat.value}</span>
                      <span className={styles.statLabel}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Benefits */}
              <div className={styles.benefitsSection}>
                <h2 className={styles.sectionTitle}>
                  {t.home.benefitsTitle}
                </h2>
                {([
                  { benefit: t.home.benefit.privacy, icon: 'shield-checkmark-outline' as BenefitIconName },
                  { benefit: t.home.benefit.instant, icon: 'flash-outline' as BenefitIconName },
                  { benefit: t.home.benefit.beautiful, icon: 'document-text-outline' as BenefitIconName },
                ]).map((item) => {
                  const IconComp = benefitIconMap[item.icon];
                  return (
                    <div key={item.benefit.title} className={styles.featureCard}>
                      <div className={styles.featureIconContainer}>
                        <IconComp size={24} />
                      </div>
                      <div className={styles.featureContent}>
                        <h3 className={styles.featureTitle}>{item.benefit.title}</h3>
                        <p className={styles.featureDescription}>
                          {item.benefit.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section 7: Closing CTA */}
              <div className={styles.closingCtaSection}>
                <h2 className={styles.closingCtaTitle}>
                  {t.home.closingCta.title}
                </h2>
                <p className={styles.closingCtaSubtitle}>
                  {t.home.closingCta.subtitle}
                </p>
                <Button
                  onPress={authenticate}
                  disabled={!isApiLoaded}
                  loading={isLoading}
                  size="lg"
                  variant="secondary"
                  style={{
                    marginBottom: 16,
                    backgroundColor: '#ffffff',
                    borderColor: '#dadce0',
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                  textStyle={{
                    color: '#3c4043',
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                  icon={<GoogleLogo size={20} />}
                >
                  {t.home.signIn}
                </Button>
                <div className={styles.closingCtaDivider}>
                  <div className={styles.dividerLine} />
                  <span className={styles.dividerText}>{t.home.or}</span>
                  <div className={styles.dividerLine} />
                </div>
                <Button
                  variant="outline"
                  onPress={handleLocalFile}
                  icon={<IoFolderOutline size={20} className={styles.closingLocalIcon} />}
                >
                  {t.home.openLocal}
                </Button>
                <button
                  className={styles.tryNowLink}
                  onClick={handleTryNow}
                  type="button"
                >
                  <IoPlayOutline size={16} />
                  <span>{t.home.tryNow}</span>
                </button>
              </div>

              {/* Section 8: Footer */}
              <div className={styles.landingFooter}>
                <div className={styles.footerBrand}>
                  <img
                    src={iconImage}
                    alt="MarkDrive"
                    className={styles.footerIcon}
                  />
                  <span className={styles.footerAppName}>MarkDrive</span>
                </div>
                <div className={styles.footerLinks}>
                  <Link to="/privacy" className={styles.footerLegalLink}>
                    {t.about.viewPrivacy}
                  </Link>
                  <span className={styles.footerLegalSeparator}>|</span>
                  <Link to="/terms" className={styles.footerLegalLink}>
                    {t.about.viewTerms}
                  </Link>
                  <span className={styles.footerLegalSeparator}>|</span>
                  <button
                    className={styles.footerGithubLink}
                    onClick={() => window.open('https://github.com/luckypool/mark-drive', '_blank')}
                    type="button"
                  >
                    <IoLogoGithub size={16} />
                    <span>{t.home.footer.viewOnGithub}</span>
                  </button>
                </div>
                <p className={styles.footerBuiltWith}>
                  {t.home.footer.builtWith}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.authenticatedContent}>
              {/* Action Buttons */}
              <div className={styles.actionRow}>
                <button className={styles.actionButton} onClick={handleOpenDrivePicker} type="button">
                  <IoSearchOutline size={20} className={styles.actionButtonIcon} />
                  <span>{t.home.searchDrive}</span>
                </button>
                <button className={styles.actionButton} onClick={handleLocalFile} type="button">
                  <IoFolderOutline size={20} className={styles.actionButtonIcon} />
                  <span>{t.home.openLocal}</span>
                </button>
              </div>

              {/* Picker Settings (collapsible, secondary) */}
              <div className={styles.pickerAccordion}>
                <button
                  className={styles.pickerAccordionTrigger}
                  onClick={() => setIsPickerSettingsOpen((prev) => !prev)}
                  type="button"
                >
                  <IoSettingsOutline size={14} className={styles.pickerAccordionIcon} />
                  <span className={styles.pickerAccordionLabel}>{t.menu.picker}</span>
                  <IoChevronDown
                    size={12}
                    className={`${styles.pickerAccordionChevron}${isPickerSettingsOpen ? ` ${styles.pickerAccordionChevronOpen}` : ''}`}
                  />
                </button>
                {isPickerSettingsOpen && (
                  <div className={styles.pickerAccordionBody}>
                    {([
                      { key: 'ownedByMe' as const, label: t.menu.pickerOwnedByMe },
                      { key: 'starred' as const, label: t.menu.pickerStarred },
                    ]).map(({ key, label }) => (
                      <div key={key} className={styles.homeSettingRow}>
                        <span className={styles.homeSettingName}>{label}</span>
                        <div className={styles.homeSettingOptions}>
                          {[false, true].map((val) => (
                            <button
                              key={String(val)}
                              className={`${styles.homeSettingOption}${pickerSettings[key] === val ? ` ${styles.homeSettingOptionActive}` : ''}`}
                              onClick={() => updatePickerSettings({ [key]: val })}
                              type="button"
                            >
                              {val ? t.menu.on : t.menu.off}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Files */}
              {recentFiles.length > 0 && (
                <div className={styles.recentSection}>
                  <div className={styles.recentHeader}>
                    <span className={styles.recentTitle}>{t.home.recentFiles}</span>
                    <button
                      className={styles.clearButton}
                      onClick={handleClearHistory}
                      type="button"
                    >
                      {t.home.clear}
                    </button>
                  </div>

                  {recentFiles.map((item) => (
                    <div
                      key={item.id}
                      className={styles.recentItem}
                      onClick={() => handleOpenHistoryFile(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleOpenHistoryFile(item); }}
                    >
                      <div className={styles.recentIcon}>
                        {item.source === 'google-drive' ? (
                          <IoLogoGoogle size={20} className={styles.recentIconIcon} />
                        ) : (
                          <IoDocumentOutline size={20} className={styles.recentIconIcon} />
                        )}
                      </div>
                      <div className={styles.recentContent}>
                        <span className={styles.recentName}>
                          {item.name}
                        </span>
                        <span className={styles.recentTime}>
                          {formatRelativeTime(item.selectedAt)}
                        </span>
                      </div>
                      <IoChevronForward size={18} className={styles.recentChevron} />
                    </div>
                  ))}
                </div>
              )}

              {recentFiles.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.privacyNotice}>
                    <IoShieldCheckmarkOutline size={20} className={styles.privacyNoticeIcon} />
                    <div className={styles.privacyContent}>
                      <h4 className={styles.privacyTitle}>
                        {t.search.privacyTitle}
                      </h4>
                      <p className={styles.privacyDesc}>
                        {t.search.privacyDesc}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drive Picker FAB */}
      {isAuthenticated && (
        <FAB
          onPress={handleOpenDrivePicker}
          icon={<IoSearchOutline size={24} color="#ffffff" />}
        />
      )}

      {/* Add to Home Screen banner for iOS Safari */}
      <AddToHomeScreenBanner />
    </div>
  );
}
