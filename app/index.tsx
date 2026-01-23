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
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../src/theme';
import { Button, LoadingSpinner, FAB } from '../src/components/ui';
import { useGoogleAuth } from '../src/hooks';
import { useFilePicker } from '../src/hooks';
import { getFileHistory, clearFileHistory, addFileToHistory } from '../src/services';
import type { FileHistoryItem } from '../src/types';

export default function HomeScreen() {
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

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          {isAuthenticated && userInfo && (
            <TouchableOpacity
              style={styles.userAvatar}
              onPress={() => setIsUserMenuOpen(!isUserMenuOpen)}
              activeOpacity={0.7}
            >
              <Ionicons name="person" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
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
              <Text style={styles.heroTitle}>Welcome to MD Viewer</Text>
              <Text style={styles.heroSubtitle}>
                A beautiful Markdown viewer for{'\n'}Google Drive
              </Text>
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="logo-google" size={24} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Google Drive Integration</Text>
                  <Text style={styles.featureDescription}>
                    Search and open Markdown files directly from your Google Drive
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="color-palette-outline" size={24} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Beautiful Rendering</Text>
                  <Text style={styles.featureDescription}>
                    Syntax highlighting, Mermaid diagrams, and clean typography
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="share-outline" size={24} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Export to PDF</Text>
                  <Text style={styles.featureDescription}>
                    Share your documents as beautifully formatted PDFs
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
                Sign in with Google
              </Button>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                variant="outline"
                onPress={handleLocalFile}
                icon={<Ionicons name="folder-outline" size={20} color={colors.accent} />}
              >
                Open Local File
              </Button>
            </View>

            {/* Learn More Link */}
            <TouchableOpacity style={styles.learnMoreLink} onPress={handleOpenAbout}>
              <Text style={styles.learnMoreText}>Learn more about MD Viewer</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.authenticatedContent}>
            {/* Search Box */}
            <Pressable style={styles.searchBox} onPress={handleOpenSearch}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <Text style={styles.searchPlaceholder}>
                Search Google Drive...
              </Text>
              {Platform.OS === 'web' && (
                <View style={styles.kbd}>
                  <Text style={styles.kbdText}>⌘K</Text>
                </View>
              )}
            </Pressable>

            {/* Recent Files */}
            {recentFiles.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>Recent Files</Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearButton}>Clear</Text>
                  </TouchableOpacity>
                </View>

                {recentFiles.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recentItem}
                    onPress={() => handleOpenHistoryFile(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentIcon}>
                      <Ionicons
                        name={item.source === 'google-drive' ? 'logo-google' : 'document-outline'}
                        size={20}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.recentContent}>
                      <Text style={styles.recentName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.recentTime}>
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

      {/* User Menu */}
      {isAuthenticated && isUserMenuOpen && (
        <>
          <Pressable
            style={styles.userMenuOverlay}
            onPress={() => setIsUserMenuOpen(false)}
          />
          <View style={styles.userMenu}>
            {userInfo && (
              <View style={styles.userMenuInfo}>
                <View style={styles.userMenuAvatar}>
                  <Ionicons name="person" size={24} color={colors.textMuted} />
                </View>
                <View style={styles.userMenuDetails}>
                  <Text style={styles.userMenuName}>{userInfo.displayName}</Text>
                  <Text style={styles.userMenuEmail}>{userInfo.email}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.userMenuItem} onPress={handleLocalFile}>
              <Ionicons name="folder-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.userMenuText}>Open Local File</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userMenuItem} onPress={handleOpenAbout}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.userMenuText}>About MD Viewer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userMenuItem, styles.userMenuLogout]}
              onPress={logout}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.userMenuText, { color: colors.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Search FAB */}
      {isAuthenticated && (
        <FAB
          onPress={handleOpenSearch}
          icon={<Ionicons name="search" size={24} color={colors.bgPrimary} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgSecondary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 160,
    height: 40,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
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
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
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
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    color: colors.textMuted,
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
    color: colors.accent,
  },

  // Authenticated Content
  authenticatedContent: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    color: colors.textMuted,
    fontSize: fontSize.base,
  },
  kbd: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  kbdText: {
    color: colors.textMuted,
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
    borderBottomColor: colors.border,
  },
  recentTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButton: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentContent: {
    flex: 1,
  },
  recentName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  recentTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },

  // User Menu
  userMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayLight,
    zIndex: 898,
  },
  userMenu: {
    position: 'absolute',
    top: 70,
    right: spacing.xl,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  userMenuAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMenuDetails: {
    flex: 1,
  },
  userMenuName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  userMenuEmail: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
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
    color: colors.textPrimary,
  },
  userMenuLogout: {
    marginTop: spacing.xs,
  },
});
