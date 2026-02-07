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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../src/theme';
import { Button, LoadingSpinner, FAB } from '../src/components/ui';
import { AddToHomeScreenBanner } from '../src/components/ui/AddToHomeScreenBanner';
import { useGoogleAuth, useTheme, useLanguage } from '../src/hooks';
import { useFilePicker } from '../src/hooks';
import { useFontSettings, FontSize, FontFamily } from '../src/contexts/FontSettingsContext';
import { getFileHistory, clearFileHistory, addFileToHistory } from '../src/services';
import type { FileHistoryItem } from '../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);

export default function HomeScreen() {
  const { colors, mode: themeMode, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
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
            {/* Hero Section with CTA */}
            <View style={styles.heroSection}>
              <Image
                source={require('../assets/images/icon.png')}
                style={styles.heroIcon}
                resizeMode="contain"
              />
              <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{t.home.welcome}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                {t.home.subtitle}
              </Text>

              {/* Primary CTA */}
              <Button
                onPress={authenticate}
                disabled={!isApiLoaded}
                loading={isLoading}
                style={styles.heroCta}
                icon={<Ionicons name="logo-google" size={20} color={colors.bgPrimary} />}
              >
                {t.home.signIn}
              </Button>

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

            {/* App Preview */}
            <View style={styles.previewSection}>
              <View style={[styles.previewContainer, { backgroundColor: colors.bgTertiary }]}>
                {Platform.OS === 'web' && (
                  <img
                    src={themeMode === 'dark' ? '/app-preview.svg' : '/app-preview-light.svg'}
                    alt="MarkDrive Preview"
                    style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                  />
                )}
              </View>
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <View style={[styles.featureCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={[styles.featureIconContainer, { backgroundColor: colors.accentMuted }]}>
                  <Ionicons name="logo-google" size={24} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{t.home.feature.drive.title}</Text>
                  <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                    {t.home.feature.drive.desc}
                  </Text>
                </View>
              </View>

              <View style={[styles.featureCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={[styles.featureIconContainer, { backgroundColor: colors.accentMuted }]}>
                  <Ionicons name="color-palette-outline" size={24} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{t.home.feature.rendering.title}</Text>
                  <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                    {t.home.feature.rendering.desc}
                  </Text>
                </View>
              </View>

              <View style={[styles.featureCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={[styles.featureIconContainer, { backgroundColor: colors.accentMuted }]}>
                  <Ionicons name="share-outline" size={24} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{t.home.feature.pdf.title}</Text>
                  <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                    {t.home.feature.pdf.desc}
                  </Text>
                </View>
              </View>
            </View>

            {/* Secondary CTA */}
            <View style={styles.secondaryCta}>
              <View style={styles.divider}>
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

            {/* Learn More Link */}
            <TouchableOpacity style={styles.learnMoreLink} onPress={handleOpenAbout}>
              <Text style={[styles.learnMoreText, { color: colors.accent }]}>{t.home.learnMore}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.accent} />
            </TouchableOpacity>

            {/* Footer Legal Links */}
            <View style={styles.footerLegal}>
              <Link href="/privacy" style={[styles.footerLegalText, { color: colors.textMuted }]}>
                {t.about.viewPrivacy}
              </Link>
              <Text style={[styles.footerLegalSeparator, { color: colors.textMuted }]}>|</Text>
              <Link href="/terms" style={[styles.footerLegalText, { color: colors.textMuted }]}>
                {t.about.viewTerms}
              </Link>
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
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
  },
  heroTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    lineHeight: fontSize.lg * 1.5,
  },

  // App Preview
  previewSection: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    maxWidth: 600,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 800 / 500,
  },

  // Features
  featuresSection: {
    marginTop: spacing['2xl'],
    gap: spacing.md,
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
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },

  // Hero CTA
  heroCta: {
    marginTop: spacing.xl,
  },

  // Secondary CTA
  secondaryCta: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },

  // Learn More
  learnMoreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  learnMoreText: {
    fontSize: fontSize.sm,
  },
  footerLegal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerLegalText: {
    fontSize: fontSize.xs,
  },
  footerLegalSeparator: {
    fontSize: fontSize.xs,
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
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  privacyDesc: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.5,
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
