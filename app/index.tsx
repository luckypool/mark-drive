/**
 * MarkDrive - Home Screen
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  Image,
  Animated,
  Dimensions,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../src/theme';
import { Button, LoadingSpinner, FAB, ThemeToggle, LanguageToggle, GoogleLogo } from '../src/components/ui';
import { AddToHomeScreenBanner } from '../src/components/ui/AddToHomeScreenBanner';
import { useGoogleAuth, useTheme, useLanguage } from '../src/hooks';
import { useFilePicker } from '../src/hooks';
import { useFontSettings, FontSize, FontFamily } from '../src/contexts/FontSettingsContext';
import { getFileHistory, clearFileHistory, addFileToHistory } from '../src/services';
import type { FileHistoryItem } from '../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);

export default function HomeScreen() {
  const { colors, mode: themeMode, resolvedMode, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { width: windowWidth } = useWindowDimensions();
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
  const menuAnimation = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: isMenuOpen ? 0 : -MENU_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

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
      router.push({
        pathname: '/viewer',
        params: {
          id: file.id,
          name: file.name,
          content: file.content,
          source: 'local',
        },
      });
    }
  }, [openPicker]);

  const handleOpenSearch = useCallback(() => {
    router.push('/search');
  }, []);

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
    router.push({
      pathname: '/viewer',
      params: {
        id: item.id,
        name: item.name,
        source: item.source,
      },
    });
  }, []);

  const handleClearHistory = useCallback(async () => {
    await clearFileHistory();
    setRecentFiles([]);
  }, []);

  const handleOpenAbout = useCallback(() => {
    setIsMenuOpen(false);
    router.push('/about');
  }, []);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Landing Header - Settings bar for non-authenticated users */}
      {!isAuthenticated && (
        <View style={[styles.landingHeader, { borderBottomColor: colors.border, backgroundColor: colors.bgSecondary }]}>
          <View style={styles.headerActions}>
            <LanguageToggle />
            <ThemeToggle />
          </View>
        </View>
      )}

      {/* Header - Only shown when authenticated */}
      {isAuthenticated && (
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bgSecondary }]}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.bgTertiary }]}
            onPress={() => setIsMenuOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Pressable
            style={[styles.headerSearchBar, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}
            onPress={handleOpenSearch}
          >
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <Text style={[styles.headerSearchText, { color: colors.textMuted }]} numberOfLines={1}>
              {t.home.searchPlaceholder}
            </Text>
            {Platform.OS === 'web' && (
              <View style={[styles.kbd, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                <Text style={[styles.kbdText, { color: colors.textMuted }]}>⌘K</Text>
              </View>
            )}
          </Pressable>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Landing Page for Non-authenticated Users */}
        {!isAuthenticated ? (
          <View style={styles.landingContainer}>
            {/* Section 1: Hero + Preview (2-column on desktop) */}
            <View style={[styles.heroRow, windowWidth >= 768 ? styles.heroRowDesktop : styles.heroRowMobile]}>
              {/* Left: Text content */}
              <View style={[styles.heroLeft, windowWidth >= 768 ? styles.heroLeftDesktop : styles.heroLeftMobile]}>
                {/* Logo row */}
                <View style={styles.heroLogoRow}>
                  <Image
                    source={require('../assets/images/icon.png')}
                    style={styles.heroLogoIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.heroLogoText, { color: colors.textPrimary }]}>MarkDrive</Text>
                </View>

                <Text style={[styles.heroTitle, { color: colors.textPrimary }, windowWidth >= 768 && styles.heroTitleDesktop]}>
                  {t.home.welcomeLine1}{'\n'}
                  {t.home.welcomeLine2}
                  <Text style={{ color: colors.accent }}>{t.home.welcomeHighlight}</Text>
                </Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }, windowWidth >= 768 && styles.heroSubtitleDesktop]}>
                  {t.home.subtitle}
                </Text>
                <Text style={[styles.heroTagline, { color: colors.textMuted }, windowWidth >= 768 && styles.heroTaglineDesktop]}>
                  {t.home.tagline}
                </Text>

                {/* Feature Badges (matching OGP image) */}
                <View style={[styles.techChips, windowWidth >= 768 ? styles.techChipsDesktop : null]}>
                  {[
                    { label: t.home.benefit.privacy.title, icon: 'shield-checkmark-outline' as const },
                    { label: t.home.feature.syntax.title, icon: 'code-slash-outline' as const },
                    { label: 'Mermaid', icon: 'git-network-outline' as const },
                  ].map((chip) => (
                    <View key={chip.label} style={[styles.techChip, { backgroundColor: colors.accentMuted, borderColor: colors.accent }]}>
                      <Ionicons name={chip.icon} size={12} color={colors.accent} />
                      <Text style={[styles.techChipText, { color: colors.accent }]}>{chip.label}</Text>
                    </View>
                  ))}
                </View>

                <Button
                  onPress={authenticate}
                  disabled={!isApiLoaded}
                  loading={isLoading}
                  size="lg"
                  variant="secondary"
                  style={windowWidth >= 768 ? { ...styles.heroCta, ...styles.heroCtaDesktop, ...styles.googleBtn } : { ...styles.heroCta, ...styles.googleBtn }}
                  textStyle={styles.googleBtnText}
                  icon={<GoogleLogo size={20} />}
                >
                  {t.home.signIn}
                </Button>
              </View>

              {/* Right: Preview image */}
              <View style={styles.heroRight}>
                <View style={[styles.previewContainer, { borderColor: colors.borderLight, ...shadows.md }]}>
                  {Platform.OS === 'web' && (
                    <img
                      src={resolvedMode === 'dark' ? '/app-preview.svg' : '/app-preview-light.svg'}
                      alt="MarkDrive Preview"
                      style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Section 3: How it Works */}
            <View style={styles.howItWorksSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t.home.howItWorks.title}
              </Text>
              <View style={[styles.stepsRow, windowWidth >= 768 && styles.stepsRowDesktop]}>
                {([
                  { step: t.home.howItWorks.step1, icon: 'log-in-outline' as const, num: '1' },
                  { step: t.home.howItWorks.step2, icon: 'search-outline' as const, num: '2' },
                  { step: t.home.howItWorks.step3, icon: 'eye-outline' as const, num: '3' },
                ]).map((item, index) => (
                  <React.Fragment key={item.num}>
                    {index > 0 && windowWidth >= 768 && (
                      <View style={styles.stepArrow}>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                      </View>
                    )}
                    {index > 0 && windowWidth < 768 && (
                      <View style={styles.stepChevron}>
                        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                      </View>
                    )}
                    <View style={[styles.stepCard, { backgroundColor: colors.bgCard, borderColor: colors.border }, windowWidth >= 768 && styles.stepCardDesktop]}>
                      <View style={[styles.stepIconWrap, { backgroundColor: colors.accentMuted }]}>
                        <Ionicons name={item.icon} size={28} color={colors.accent} />
                      </View>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                        {item.step.title}
                      </Text>
                      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                        {item.step.desc}
                      </Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Section 4: Features (6 items, 2-column grid) */}
            <View style={styles.featuresSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t.home.featuresTitle}
              </Text>
              <View style={styles.featuresGrid}>
                {([
                  { title: t.home.feature.drive.title, desc: t.home.feature.drive.desc, icon: 'logo-google' as const },
                  { title: t.home.feature.rendering.title, desc: t.home.feature.rendering.desc, icon: 'color-palette-outline' as const },
                  { title: t.home.feature.pdf.title, desc: t.home.feature.pdf.desc, icon: 'share-outline' as const },
                  { title: t.home.feature.syntax.title, desc: t.home.feature.syntax.desc, icon: 'code-slash-outline' as const },
                  { title: t.home.feature.mermaid.title, desc: t.home.feature.mermaid.desc, icon: 'git-network-outline' as const },
                  { title: t.home.feature.local.title, desc: t.home.feature.local.desc, icon: 'folder-outline' as const },
                ]).map((feature) => (
                  <View
                    key={feature.title}
                    style={[
                      styles.featureCardVertical,
                      { backgroundColor: colors.bgCard, borderColor: colors.border },
                      windowWidth >= 500 ? styles.featureCardHalf : styles.featureCardFull,
                    ]}
                  >
                    <View style={[styles.featureIconContainer, { backgroundColor: colors.accentMuted }]}>
                      <Ionicons name={feature.icon} size={24} color={colors.accent} />
                    </View>
                    <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{feature.title}</Text>
                    <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                      {feature.desc}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Section 5: Stats */}
            <View style={styles.techSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t.home.techTitle}
              </Text>
              <View style={styles.statsRow}>
                {([
                  t.home.stats.clientSide,
                  t.home.stats.serverStorage,
                  t.home.stats.license,
                ]).map((stat) => (
                  <View key={stat.label} style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.accent }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Section 6: Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t.home.benefitsTitle}
              </Text>
              {([
                { benefit: t.home.benefit.privacy, icon: 'shield-checkmark-outline' as const },
                { benefit: t.home.benefit.instant, icon: 'flash-outline' as const },
                { benefit: t.home.benefit.beautiful, icon: 'document-text-outline' as const },
              ]).map((item) => (
                <View key={item.benefit.title} style={[styles.featureCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                  <View style={[styles.featureIconContainer, { backgroundColor: colors.accentMuted }]}>
                    <Ionicons name={item.icon} size={24} color={colors.accent} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{item.benefit.title}</Text>
                    <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                      {item.benefit.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Section 7: Closing CTA */}
            <View style={[styles.closingCtaSection, { backgroundColor: colors.accentMuted, borderRadius: borderRadius.xl }]}>
              <Text style={[styles.closingCtaTitle, { color: colors.textPrimary }]}>
                {t.home.closingCta.title}
              </Text>
              <Text style={[styles.closingCtaSubtitle, { color: colors.textSecondary }]}>
                {t.home.closingCta.subtitle}
              </Text>
              <Button
                onPress={authenticate}
                disabled={!isApiLoaded}
                loading={isLoading}
                size="lg"
                variant="secondary"
                style={{ ...styles.closingCtaButton, ...styles.googleBtn }}
                textStyle={styles.googleBtnText}
                icon={<GoogleLogo size={20} />}
              >
                {t.home.signIn}
              </Button>
              <View style={styles.closingCtaDivider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>{t.home.or}</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>
              <Button
                variant="outline"
                onPress={handleLocalFile}
                icon={<Ionicons name="folder-outline" size={20} color={colors.accent} />}
              >
                {t.home.openLocal}
              </Button>
            </View>

            {/* Section 8: Footer */}
            <View style={[styles.landingFooter, { borderTopColor: colors.border }]}>
              <View style={styles.footerBrand}>
                <Image
                  source={require('../assets/images/icon.png')}
                  style={styles.footerIcon}
                  resizeMode="contain"
                />
                <Text style={[styles.footerAppName, { color: colors.textPrimary }]}>MarkDrive</Text>
              </View>
              <View style={styles.footerLinks}>
                <Link href="/privacy" style={[styles.footerLegalText, { color: colors.textMuted }]}>
                  {t.about.viewPrivacy}
                </Link>
                <Text style={[styles.footerLegalSeparator, { color: colors.textMuted }]}>|</Text>
                <Link href="/terms" style={[styles.footerLegalText, { color: colors.textMuted }]}>
                  {t.about.viewTerms}
                </Link>
                <Text style={[styles.footerLegalSeparator, { color: colors.textMuted }]}>|</Text>
                <TouchableOpacity
                  style={styles.footerGithubLink}
                  onPress={() => Linking.openURL('https://github.com/luckypool/mark-drive')}
                >
                  <Ionicons name="logo-github" size={16} color={colors.textMuted} />
                  <Text style={[styles.footerLegalText, { color: colors.textMuted }]}>
                    {t.home.footer.viewOnGithub}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.footerBuiltWith, { color: colors.textMuted }]}>
                {t.home.footer.builtWith}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.authenticatedContent}>
            {/* Recent Files */}
            {recentFiles.length > 0 && (
              <View style={styles.recentSection}>
                <View style={[styles.recentHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.recentTitle, { color: colors.textSecondary }]}>{t.home.recentFiles}</Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={[styles.clearButton, { color: colors.textMuted }]}>{t.home.clear}</Text>
                  </TouchableOpacity>
                </View>

                {recentFiles.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.recentItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                    onPress={() => handleOpenHistoryFile(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.recentIcon, { backgroundColor: colors.accentMuted }]}>
                      <Ionicons
                        name={item.source === 'google-drive' ? 'logo-google' : 'document-outline'}
                        size={20}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.recentContent}>
                      <Text style={[styles.recentName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.recentTime, { color: colors.textMuted }]}>
                        {formatRelativeTime(item.selectedAt)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {recentFiles.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                  {t.home.searchPlaceholder}
                </Text>

                {/* Privacy Notice */}
                <View style={[styles.privacyNotice, { backgroundColor: colors.accentMuted, borderColor: colors.accent }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
                  <View style={styles.privacyContent}>
                    <Text style={[styles.privacyTitle, { color: colors.accent }]}>
                      {t.search.privacyTitle}
                    </Text>
                    <Text style={[styles.privacyDesc, { color: colors.textSecondary }]}>
                      {t.search.privacyDesc}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Slide-in Menu Overlay */}
      {isMenuOpen && (
        <Pressable
          style={[styles.menuOverlay, { backgroundColor: colors.overlayLight }]}
          onPress={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-in Menu */}
      {isMenuOpen && (
        <Animated.View
          style={[
            styles.slideMenu,
            {
              backgroundColor: colors.bgSecondary,
              transform: [{ translateX: menuAnimation }],
            },
          ]}
        >
        <SafeAreaView style={styles.slideMenuContent} edges={['top']}>
          {/* User Info */}
          {userInfo && (
            <View style={[styles.menuUserSection, { borderBottomColor: colors.border }]}>
              {userInfo.photoUrl ? (
                <Image
                  source={{ uri: userInfo.photoUrl }}
                  style={styles.menuAvatarImage}
                />
              ) : (
                <View style={[styles.menuAvatar, { backgroundColor: colors.bgTertiary }]}>
                  <Ionicons name="person" size={28} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.menuUserInfo}>
                <Text style={[styles.menuUserName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {userInfo.displayName}
                </Text>
                <Text style={[styles.menuUserEmail, { color: colors.textMuted }]} numberOfLines={1}>
                  {userInfo.email}
                </Text>
              </View>
            </View>
          )}

          <ScrollView style={styles.menuScrollView}>
            {/* Display Settings */}
            <View style={styles.menuSection}>
              <Text style={[styles.menuSectionTitle, { color: colors.textMuted }]}>
                {t.menu.display}
              </Text>

              {/* Font Size */}
              <View style={styles.menuSettingRow}>
                <Text style={[styles.menuSettingLabel, { color: colors.textPrimary }]}>
                  {t.fontSettings.fontSize}
                </Text>
                <View style={styles.menuSettingOptions}>
                  {fontSizeOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.menuOption,
                        {
                          backgroundColor: fontSettings.fontSize === option.value ? colors.accentMuted : colors.bgTertiary,
                        }
                      ]}
                      onPress={() => setFontSize(option.value)}
                    >
                      <Text style={[
                        styles.menuOptionText,
                        { color: fontSettings.fontSize === option.value ? colors.accent : colors.textSecondary }
                      ]}>
                        {fontSizeLabels[option.labelKey]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Font Family */}
              <View style={styles.menuSettingRow}>
                <Text style={[styles.menuSettingLabel, { color: colors.textPrimary }]}>
                  {t.fontSettings.fontFamily}
                </Text>
                <View style={styles.menuSettingOptions}>
                  {fontFamilyOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.menuOption,
                        {
                          backgroundColor: fontSettings.fontFamily === option.value ? colors.accentMuted : colors.bgTertiary,
                        }
                      ]}
                      onPress={() => setFontFamily(option.value)}
                    >
                      <Text style={[
                        styles.menuOptionText,
                        { color: fontSettings.fontFamily === option.value ? colors.accent : colors.textSecondary }
                      ]}>
                        {fontFamilyLabels[option.labelKey]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Theme */}
            <View style={styles.menuSection}>
              <Text style={[styles.menuSectionTitle, { color: colors.textMuted }]}>
                {t.settings.theme}
              </Text>
              <View style={styles.menuSettingOptions}>
                <TouchableOpacity
                  style={[
                    styles.menuOption,
                    styles.menuOptionWide,
                    { backgroundColor: themeMode === 'light' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setTheme('light')}
                >
                  <Ionicons name="sunny-outline" size={18} color={themeMode === 'light' ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.menuOptionText, { color: themeMode === 'light' ? colors.accent : colors.textSecondary }]}>
                    {t.settings.light}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.menuOption,
                    styles.menuOptionWide,
                    { backgroundColor: themeMode === 'dark' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setTheme('dark')}
                >
                  <Ionicons name="moon-outline" size={18} color={themeMode === 'dark' ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.menuOptionText, { color: themeMode === 'dark' ? colors.accent : colors.textSecondary }]}>
                    {t.settings.dark}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.menuOption,
                    styles.menuOptionWide,
                    { backgroundColor: themeMode === 'system' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setTheme('system')}
                >
                  <Ionicons name="phone-portrait-outline" size={18} color={themeMode === 'system' ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.menuOptionText, { color: themeMode === 'system' ? colors.accent : colors.textSecondary }]}>
                    {t.settings.system}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Language */}
            <View style={styles.menuSection}>
              <Text style={[styles.menuSectionTitle, { color: colors.textMuted }]}>
                {t.settings.language}
              </Text>
              <View style={styles.menuSettingOptions}>
                <TouchableOpacity
                  style={[
                    styles.menuOption,
                    styles.menuOptionWide,
                    { backgroundColor: language === 'en' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.menuOptionText, { color: language === 'en' ? colors.accent : colors.textSecondary }]}>
                    English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.menuOption,
                    styles.menuOptionWide,
                    { backgroundColor: language === 'ja' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setLanguage('ja')}
                >
                  <Text style={[styles.menuOptionText, { color: language === 'ja' ? colors.accent : colors.textSecondary }]}>
                    日本語
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={[styles.menuSection, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLocalFile}
              >
                <Ionicons name="folder-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>{t.home.openLocal}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleOpenAbout}
              >
                <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>{t.home.about}</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Out */}
            <View style={[styles.menuSection, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>{t.home.signOut}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
      )}

      {/* Search FAB */}
      {isAuthenticated && (
        <FAB
          onPress={handleOpenSearch}
          icon={<Ionicons name="search" size={24} color="#ffffff" />}
        />
      )}

      {/* Add to Home Screen banner for iOS Safari */}
      <AddToHomeScreenBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  landingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  headerSearchText: {
    flex: 1,
    fontSize: fontSize.base,
  },
  kbd: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
  },
  kbdText: {
    fontSize: fontSize.xs,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing.xl,
  },

  // Landing Page
  landingContainer: {
    flex: 1,
    maxWidth: 1080,
    alignSelf: 'center',
    width: '100%',
  },
  heroRow: {
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  heroRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroLeft: {
    gap: spacing.xs,
  },
  heroLeftDesktop: {
    flex: 1,
    alignItems: 'flex-start',
  },
  heroLeftMobile: {
    alignItems: 'center',
  },
  heroRight: {
    flex: 1,
    width: '100%',
  },
  heroLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  heroLogoIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
  },
  heroLogoText: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
  heroTitle: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: fontSize['4xl'] * 1.15,
  },
  heroTitleDesktop: {
    textAlign: 'left',
  },
  heroSubtitle: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: fontSize.xs * 1.6,
  },
  heroSubtitleDesktop: {
    textAlign: 'left',
  },
  heroTagline: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  heroTaglineDesktop: {
    textAlign: 'left',
  },

  // Section Title (shared)
  sectionTitle: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },

  // App Preview
  previewContainer: {
    width: '100%',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    overflow: 'hidden',
  },
  // How it Works
  howItWorksSection: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  stepsRow: {
    width: '100%',
    gap: spacing.sm,
  },
  stepsRowDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stepCard: {
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    width: '100%',
  },
  stepCardDesktop: {
    flex: 1,
  },
  stepIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  stepTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    textAlign: 'left',
  },
  stepDesc: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.6,
    textAlign: 'left',
  },
  stepChevron: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  stepArrow: {
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },

  // Features
  featuresSection: {
    marginTop: spacing['2xl'],
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCardVertical: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  featureCardHalf: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  featureCardFull: {
    flexBasis: '100%',
  },
  featureCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * 1.6,
  },

  // Stats / Tech
  techSection: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  techChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  techChipsDesktop: {
    justifyContent: 'flex-start',
  },
  techChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  techChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.lg,
    marginTop: spacing.xs,
  },

  // Benefits
  benefitsSection: {
    marginTop: spacing['2xl'],
    gap: spacing.md,
  },

  // Closing CTA
  closingCtaSection: {
    marginTop: spacing['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
  },
  closingCtaTitle: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  closingCtaSubtitle: {
    fontSize: fontSize['2xl'],
    textAlign: 'center',
    lineHeight: fontSize['2xl'] * 1.5,
    marginBottom: spacing.xl,
  },
  closingCtaButton: {
    marginBottom: spacing.md,
  },
  closingCtaDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    marginBottom: spacing.md,
  },

  // Hero CTA
  heroCta: {
    marginTop: spacing.xl,
  },
  heroCtaDesktop: {
    alignSelf: 'flex-start',
  },

  // Google Sign-in Button (Brand Guidelines)
  googleBtn: {
    backgroundColor: '#ffffff',
    borderColor: '#dadce0',
    borderWidth: 1,
  },
  googleBtnText: {
    color: '#3c4043',
    fontFamily: Platform.OS === 'web' ? "'Roboto', sans-serif" : undefined,
    fontWeight: '500',
    fontSize: 14,
  },

  // Divider (shared)
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },

  // Footer
  landingFooter: {
    marginTop: spacing['2xl'],
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: spacing.md,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
  },
  footerAppName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  footerGithubLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerLegalText: {
    fontSize: fontSize.xs,
  },
  footerLegalSeparator: {
    fontSize: fontSize.xs,
  },
  footerBuiltWith: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },

  // Privacy Notice
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    maxWidth: 320,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  privacyDesc: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },

  // Authenticated Content
  authenticatedContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['2xl'],
  },
  emptyStateText: {
    fontSize: fontSize.base,
  },

  // Recent Files
  recentSection: {
    marginTop: spacing.md,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  recentTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButton: {
    fontSize: fontSize.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentContent: {
    flex: 1,
  },
  recentName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  recentTime: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },

  // Menu Overlay
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
  },

  // Slide-in Menu
  slideMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    zIndex: 999,
    ...shadows.xl,
  },
  slideMenuContent: {
    flex: 1,
  },
  menuScrollView: {
    flex: 1,
  },
  menuUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  menuUserInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  menuUserName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  menuUserEmail: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  menuSection: {
    padding: spacing.md,
  },
  menuSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  menuSettingRow: {
    marginBottom: spacing.md,
  },
  menuSettingLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  menuSettingOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  menuOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOptionWide: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  menuOptionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: fontSize.base,
  },
});
