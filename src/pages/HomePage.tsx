/**
 * MarkDrive - Home Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  IoMenu,
  IoSearch,
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
  IoPersonOutline,
  IoInformationCircleOutline,
  IoLogOutOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoPhonePortraitOutline,
  IoLogoGithub,
} from 'react-icons/io5';
import { Button, LoadingSpinner, FAB, ThemeToggle, LanguageToggle, GoogleLogo } from '../components/ui';
import { AddToHomeScreenBanner } from '../components/ui/AddToHomeScreenBanner';
import { useGoogleAuth, useTheme, useLanguage } from '../hooks';
import { useFilePicker } from '../hooks';
import { useFontSettings, FontSize, FontFamily } from '../contexts/FontSettingsContext';
import { getFileHistory, clearFileHistory, addFileToHistory } from '../services';
import type { FileHistoryItem } from '../types';
import iconImage from '../../assets/images/icon.png';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { resolvedMode, mode: themeMode, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 768;
  const { settings: fontSettings, setFontSize, setFontFamily } = useFontSettings();
  const {
    isLoading,
    isApiLoaded,
    isAuthenticated,
    userInfo,
    authenticate,
    logout,
  } = useGoogleAuth();

  const { openPicker } = useFilePicker();
  const [recentFiles, setRecentFiles] = useState<FileHistoryItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await getFileHistory();
    setRecentFiles(history);
  };

  const handleLocalFile = useCallback(async () => {
    setIsMenuOpen(false);
    const file = await openPicker();
    if (file) {
      await addFileToHistory({
        id: file.id,
        name: file.name,
        source: 'local',
      });
      const params = new URLSearchParams({
        id: file.id,
        name: file.name,
        content: file.content,
        source: 'local',
      });
      navigate(`/viewer?${params.toString()}`);
    }
  }, [openPicker, navigate]);

  const handleOpenSearch = useCallback(() => {
    navigate('/search');
  }, [navigate]);

  // Keyboard shortcut: Cmd+K to open search
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpenSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, handleOpenSearch]);

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

  const handleOpenAbout = useCallback(() => {
    setIsMenuOpen(false);
    navigate('/about');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setIsMenuOpen(false);
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

  const fontSizeOptions: { value: FontSize; labelKey: 'small' | 'medium' | 'large' }[] = [
    { value: 'small', labelKey: 'small' },
    { value: 'medium', labelKey: 'medium' },
    { value: 'large', labelKey: 'large' },
  ];

  const fontFamilyOptions: { value: FontFamily; labelKey: 'system' | 'serif' | 'sansSerif' }[] = [
    { value: 'system', labelKey: 'system' },
    { value: 'serif', labelKey: 'serif' },
    { value: 'sans-serif', labelKey: 'sansSerif' },
  ];

  const fontSizeLabels: Record<'small' | 'medium' | 'large', string> = {
    small: t.fontSettings.small,
    medium: t.fontSettings.medium,
    large: t.fontSettings.large,
  };

  const fontFamilyLabels: Record<'system' | 'serif' | 'sansSerif', string> = {
    system: t.fontSettings.system,
    serif: t.fontSettings.serif,
    sansSerif: t.fontSettings.sansSerif,
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
          <div className={styles.headerActions}>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Header - Only shown when authenticated */}
      {isAuthenticated && (
        <div className={styles.header}>
          <button
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(true)}
            type="button"
          >
            <IoMenu size={22} />
          </button>

          <div
            className={styles.headerSearchBar}
            onClick={handleOpenSearch}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleOpenSearch(); }}
          >
            <IoSearch size={18} className={styles.headerSearchIcon} />
            <span className={styles.headerSearchText}>
              {t.home.searchPlaceholder}
            </span>
            <span className={styles.kbd}>
              <span className={styles.kbdText}>&#8984;K</span>
            </span>
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
                  {/* Logo row */}
                  <div className={styles.heroLogoRow}>
                    <img
                      src={iconImage}
                      alt="MarkDrive"
                      className={styles.heroLogoIcon}
                    />
                    <span className={styles.heroLogoText}>MarkDrive</span>
                  </div>

                  <h1 className={styles.heroTitle}>
                    {t.home.welcomeLine1}
                    <br />
                    {t.home.welcomeLine2}
                    <span className={styles.heroHighlight}>{t.home.welcomeHighlight}</span>
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
                  <IoSearchOutline size={48} />
                  <span className={styles.emptyStateText}>
                    {t.home.searchPlaceholder}
                  </span>

                  {/* Privacy Notice */}
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

      {/* Slide-in Menu Overlay */}
      {isMenuOpen && (
        <div
          className={styles.menuOverlay}
          onClick={() => setIsMenuOpen(false)}
          role="presentation"
        />
      )}

      {/* Slide-in Menu */}
      <div className={`${styles.slideMenu} ${isMenuOpen ? styles.slideMenuOpen : ''}`}>
        <div className={styles.slideMenuContent}>
          {/* User Info */}
          {userInfo && (
            <div className={styles.menuUserSection}>
              {userInfo.photoUrl ? (
                <img
                  src={userInfo.photoUrl}
                  alt={userInfo.displayName}
                  className={styles.menuAvatarImage}
                />
              ) : (
                <div className={styles.menuAvatar}>
                  <IoPersonOutline size={28} />
                </div>
              )}
              <div className={styles.menuUserInfo}>
                <span className={styles.menuUserName}>
                  {userInfo.displayName}
                </span>
                <span className={styles.menuUserEmail}>
                  {userInfo.email}
                </span>
              </div>
            </div>
          )}

          <div className={styles.menuScrollView}>
            {/* Display Settings */}
            <div className={styles.menuSection}>
              <span className={styles.menuSectionTitle}>
                {t.menu.display}
              </span>

              {/* Font Size */}
              <div className={styles.menuSettingRow}>
                <span className={styles.menuSettingLabel}>
                  {t.fontSettings.fontSize}
                </span>
                <div className={styles.menuSettingOptions}>
                  {fontSizeOptions.map(option => (
                    <button
                      key={option.value}
                      className={styles.menuOption}
                      style={{
                        backgroundColor: fontSettings.fontSize === option.value
                          ? 'var(--color-accent-muted)'
                          : 'var(--color-bg-tertiary)',
                      }}
                      onClick={() => setFontSize(option.value)}
                      type="button"
                    >
                      <span
                        className={styles.menuOptionText}
                        style={{
                          color: fontSettings.fontSize === option.value
                            ? 'var(--color-accent)'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        {fontSizeLabels[option.labelKey]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className={styles.menuSettingRow}>
                <span className={styles.menuSettingLabel}>
                  {t.fontSettings.fontFamily}
                </span>
                <div className={styles.menuSettingOptions}>
                  {fontFamilyOptions.map(option => (
                    <button
                      key={option.value}
                      className={styles.menuOption}
                      style={{
                        backgroundColor: fontSettings.fontFamily === option.value
                          ? 'var(--color-accent-muted)'
                          : 'var(--color-bg-tertiary)',
                      }}
                      onClick={() => setFontFamily(option.value)}
                      type="button"
                    >
                      <span
                        className={styles.menuOptionText}
                        style={{
                          color: fontSettings.fontFamily === option.value
                            ? 'var(--color-accent)'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        {fontFamilyLabels[option.labelKey]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme */}
            <div className={styles.menuSection}>
              <span className={styles.menuSectionTitle}>
                {t.settings.theme}
              </span>
              <div className={styles.menuSettingOptions}>
                <button
                  className={`${styles.menuOption} ${styles.menuOptionWide}`}
                  style={{
                    backgroundColor: themeMode === 'light'
                      ? 'var(--color-accent-muted)'
                      : 'var(--color-bg-tertiary)',
                  }}
                  onClick={() => setTheme('light')}
                  type="button"
                >
                  <IoSunnyOutline
                    size={18}
                    style={{
                      color: themeMode === 'light'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                    }}
                  />
                  <span
                    className={styles.menuOptionText}
                    style={{
                      color: themeMode === 'light'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                    }}
                  >
                    {t.settings.light}
                  </span>
                </button>
                <button
                  className={`${styles.menuOption} ${styles.menuOptionWide}`}
                  style={{
                    backgroundColor: themeMode === 'dark'
                      ? 'var(--color-accent-muted)'
                      : 'var(--color-bg-tertiary)',
                  }}
                  onClick={() => setTheme('dark')}
                  type="button"
                >
                  <IoMoonOutline
                    size={18}
                    style={{
                      color: themeMode === 'dark'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                    }}
                  />
                  <span
                    className={styles.menuOptionText}
                    style={{
                      color: themeMode === 'dark'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                    }}
                  >
                    {t.settings.dark}
                  </span>
                </button>
                <button
                  className={`${styles.menuOption} ${styles.menuOptionWide}`}
                  style={{
                    backgroundColor: themeMode === 'system'
                      ? 'var(--color-accent-muted)'
                      : 'var(--color-bg-tertiary)',
                  }}
                  onClick={() => setTheme('system')}
                  type="button"
                >
                  <IoPhonePortraitOutline
                    size={18}
                    style={{
                      color: themeMode === 'system'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                    }}
                  />
                  <span
                    className={styles.menuOptionText}
                    style={{
                      color: themeMode === 'system'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                    }}
                  >
                    {t.settings.system}
                  </span>
                </button>
              </div>
            </div>

            {/* Language */}
            <div className={styles.menuSection}>
              <span className={styles.menuSectionTitle}>
                {t.settings.language}
              </span>
              <div className={styles.menuSettingOptions}>
                <button
                  className={`${styles.menuOption} ${styles.menuOptionWide}`}
                  style={{
                    backgroundColor: language === 'en'
                      ? 'var(--color-accent-muted)'
                      : 'var(--color-bg-tertiary)',
                  }}
                  onClick={() => setLanguage('en')}
                  type="button"
                >
                  <span
                    className={styles.menuOptionText}
                    style={{
                      color: language === 'en'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                    }}
                  >
                    English
                  </span>
                </button>
                <button
                  className={`${styles.menuOption} ${styles.menuOptionWide}`}
                  style={{
                    backgroundColor: language === 'ja'
                      ? 'var(--color-accent-muted)'
                      : 'var(--color-bg-tertiary)',
                  }}
                  onClick={() => setLanguage('ja')}
                  type="button"
                >
                  <span
                    className={styles.menuOptionText}
                    style={{
                      color: language === 'ja'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                    }}
                  >
                    日本語
                  </span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.menuSectionBordered}>
              <button
                className={styles.menuItem}
                onClick={handleLocalFile}
                type="button"
              >
                <IoFolderOutline size={20} className={styles.menuItemIcon} />
                <span className={styles.menuItemText}>{t.home.openLocal}</span>
              </button>

              <button
                className={styles.menuItem}
                onClick={handleOpenAbout}
                type="button"
              >
                <IoInformationCircleOutline size={20} className={styles.menuItemIcon} />
                <span className={styles.menuItemText}>{t.home.about}</span>
              </button>
            </div>

            {/* Sign Out */}
            <div className={styles.menuSectionBordered}>
              <button
                className={styles.menuItem}
                onClick={handleLogout}
                type="button"
              >
                <IoLogOutOutline size={20} className={styles.menuItemDanger} />
                <span className={`${styles.menuItemText} ${styles.menuItemDanger}`}>{t.home.signOut}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search FAB */}
      {isAuthenticated && (
        <FAB
          onPress={handleOpenSearch}
          icon={<IoSearch size={24} color="#ffffff" />}
        />
      )}

      {/* Add to Home Screen banner for iOS Safari */}
      <AddToHomeScreenBanner />
    </div>
  );
}
