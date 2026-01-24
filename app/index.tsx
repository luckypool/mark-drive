/**
 * MD Viewer - Home Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../src/theme';
import { Button, LoadingSpinner, FAB } from '../src/components/ui';
import { useGoogleAuth, useTheme, useLanguage } from '../src/hooks';
import { useFilePicker } from '../src/hooks';
import { getFileHistory, clearFileHistory, addFileToHistory } from '../src/services';
import type { FileHistoryItem } from '../src/types';

export default function HomeScreen() {
  const { colors, mode: themeMode, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await getFileHistory();
    setRecentFiles(history);
  };

  const handleLocalFile = useCallback(async () => {
    setIsUserMenuOpen(false);
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
    router.push('/about');
  }, []);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bgSecondary }]}>
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.menuButton, { backgroundColor: colors.bgTertiary }]}
              onPress={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {isAuthenticated && userInfo && (
              <TouchableOpacity
                style={[styles.userAvatar, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}
                onPress={() => setIsUserMenuOpen(!isUserMenuOpen)}
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Landing Page for Non-authenticated Users */}
        {!isAuthenticated ? (
          <View style={styles.landingContainer}>
            {/* Hero Section */}
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

            {/* CTA Section */}
            <View style={styles.ctaSection}>
              <Button
                onPress={authenticate}
                disabled={!isApiLoaded}
                loading={isLoading}
                style={styles.ctaButton}
                icon={<Ionicons name="logo-google" size={20} color={colors.bgPrimary} />}
              >
                {t.home.signIn}
              </Button>

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
          </View>
        ) : (
          <View style={styles.authenticatedContent}>
            {/* Search Box */}
            <Pressable style={[styles.searchBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]} onPress={handleOpenSearch}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>
                {t.home.searchPlaceholder}
              </Text>
              {Platform.OS === 'web' && (
                <View style={[styles.kbd, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
                  <Text style={[styles.kbdText, { color: colors.textMuted }]}>⌘K</Text>
                </View>
              )}
            </Pressable>

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
          </View>
        )}
      </ScrollView>

      {/* Settings Menu */}
      {isSettingsMenuOpen && (
        <>
          <Pressable
            style={[styles.settingsMenuOverlay, { backgroundColor: colors.overlayLight }]}
            onPress={() => setIsSettingsMenuOpen(false)}
          />
          <View style={[styles.settingsMenu, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            {/* Theme Setting */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textMuted }]}>
                {t.settings.theme}
              </Text>
              <View style={styles.settingsOptions}>
                <TouchableOpacity
                  style={[
                    styles.settingsOption,
                    { backgroundColor: themeMode === 'light' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setTheme('light')}
                >
                  <Ionicons name="sunny-outline" size={18} color={themeMode === 'light' ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.settingsOptionText, { color: themeMode === 'light' ? colors.accent : colors.textSecondary }]}>
                    {t.settings.light}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.settingsOption,
                    { backgroundColor: themeMode === 'dark' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setTheme('dark')}
                >
                  <Ionicons name="moon-outline" size={18} color={themeMode === 'dark' ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.settingsOptionText, { color: themeMode === 'dark' ? colors.accent : colors.textSecondary }]}>
                    {t.settings.dark}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Language Setting */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textMuted }]}>
                {t.settings.language}
              </Text>
              <View style={styles.settingsOptions}>
                <TouchableOpacity
                  style={[
                    styles.settingsOption,
                    { backgroundColor: language === 'en' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.settingsOptionText, { color: language === 'en' ? colors.accent : colors.textSecondary }]}>
                    English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.settingsOption,
                    { backgroundColor: language === 'ja' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setLanguage('ja')}
                >
                  <Text style={[styles.settingsOptionText, { color: language === 'ja' ? colors.accent : colors.textSecondary }]}>
                    日本語
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* About Link */}
            <TouchableOpacity
              style={[styles.settingsMenuItem, { borderTopColor: colors.border }]}
              onPress={() => { setIsSettingsMenuOpen(false); handleOpenAbout(); }}
            >
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingsMenuItemText, { color: colors.textPrimary }]}>{t.home.about}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* User Menu */}
      {isAuthenticated && isUserMenuOpen && (
        <>
          <Pressable
            style={[styles.userMenuOverlay, { backgroundColor: colors.overlayLight }]}
            onPress={() => setIsUserMenuOpen(false)}
          />
          <View style={[styles.userMenu, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            {userInfo && (
              <View style={[styles.userMenuInfo, { borderBottomColor: colors.border }]}>
                <View style={[styles.userMenuAvatar, { backgroundColor: colors.bgTertiary }]}>
                  <Ionicons name="person" size={24} color={colors.textMuted} />
                </View>
                <View style={styles.userMenuDetails}>
                  <Text style={[styles.userMenuName, { color: colors.textPrimary }]}>{userInfo.displayName}</Text>
                  <Text style={[styles.userMenuEmail, { color: colors.textMuted }]}>{userInfo.email}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.userMenuItem} onPress={handleLocalFile}>
              <Ionicons name="folder-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.userMenuText, { color: colors.textPrimary }]}>{t.home.openLocal}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userMenuItem, styles.userMenuLogout]}
              onPress={logout}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.userMenuText, { color: colors.error }]}>{t.home.signOut}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Search FAB */}
      {isAuthenticated && (
        <FAB
          onPress={handleOpenSearch}
          icon={<Ionicons name="search" size={24} color="#ffffff" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 40,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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

  // Features
  featuresSection: {
    marginTop: spacing.xl,
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

  // CTA
  ctaSection: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  ctaButton: {
    marginBottom: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    marginVertical: spacing.md,
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

  // Authenticated Content
  authenticatedContent: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: fontSize.base,
  },
  kbd: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
  },
  kbdText: {
    fontSize: fontSize.xs,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
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

  // Settings Menu
  settingsMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 896,
  },
  settingsMenu: {
    position: 'absolute',
    top: 70,
    right: spacing.xl,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: 220,
    zIndex: 897,
    ...shadows.lg,
  },
  settingsSection: {
    marginBottom: spacing.md,
  },
  settingsSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  settingsOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  settingsOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  settingsOptionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  settingsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },
  settingsMenuItemText: {
    fontSize: fontSize.base,
  },

  // User Menu
  userMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 898,
  },
  userMenu: {
    position: 'absolute',
    top: 70,
    right: spacing.xl,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    minWidth: 240,
    zIndex: 899,
    ...shadows.lg,
  },
  userMenuInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  userMenuAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMenuDetails: {
    flex: 1,
  },
  userMenuName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  userMenuEmail: {
    fontSize: fontSize.xs,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  userMenuText: {
    fontSize: fontSize.base,
  },
  userMenuLogout: {
    marginTop: spacing.xs,
  },
});
