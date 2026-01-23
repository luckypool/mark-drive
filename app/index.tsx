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
  const [isFabOpen, setIsFabOpen] = useState(false);

  // 履歴を読み込む
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await getFileHistory();
    setRecentFiles(history);
  };

  // ローカルファイルを選択
  const handleLocalFile = useCallback(async () => {
    setIsFabOpen(false);
    const file = await openPicker();
    if (file) {
      await addFileToHistory({
        id: file.id,
        name: file.name,
        source: 'local',
      });
      // ビューアーに遷移（内容をパラメータで渡す）
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

  // Google Drive 検索を開く
  const handleOpenSearch = useCallback(() => {
    setIsFabOpen(false);
    router.push('/search');
  }, []);

  // 履歴からファイルを開く
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

  // 履歴をクリア
  const handleClearHistory = useCallback(async () => {
    await clearFileHistory();
    setRecentFiles([]);
  }, []);

  // 相対時間を計算
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP');
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
          {userInfo && (
            <Text style={styles.userEmail}>{userInfo.email}</Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Empty State / Login Prompt */}
        {!isAuthenticated ? (
          <View style={styles.emptyState}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.welcomeIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>MD Viewer へようこそ</Text>
            <Text style={styles.emptyDescription}>
              Google Drive の Markdown ファイルを{'\n'}美しく表示します
            </Text>

            <Button
              onPress={authenticate}
              disabled={!isApiLoaded}
              loading={isLoading}
              style={styles.loginButton}
              icon={<Ionicons name="logo-google" size={20} color={colors.bgPrimary} />}
            >
              Google でログイン
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>または</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              variant="outline"
              onPress={handleLocalFile}
              icon={<Ionicons name="folder-outline" size={20} color={colors.accent} />}
            >
              ローカルファイルを開く
            </Button>
          </View>
        ) : (
          <View style={styles.authenticatedContent}>
            {/* Search Box */}
            <Pressable style={styles.searchBox} onPress={handleOpenSearch}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <Text style={styles.searchPlaceholder}>
                Google Drive を検索...
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
                  <Text style={styles.recentTitle}>最近のファイル</Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearButton}>クリア</Text>
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

      {/* FAB Menu */}
      {isAuthenticated && (
        <>
          {isFabOpen && (
            <Pressable
              style={styles.fabOverlay}
              onPress={() => setIsFabOpen(false)}
            />
          )}
          {isFabOpen && (
            <View style={styles.fabMenu}>
              {userInfo && (
                <View style={styles.fabUserInfo}>
                  <View style={styles.fabAvatar}>
                    <Ionicons name="person" size={24} color={colors.textMuted} />
                  </View>
                  <View style={styles.fabUserDetails}>
                    <Text style={styles.fabUserName}>{userInfo.displayName}</Text>
                    <Text style={styles.fabUserEmail}>{userInfo.email}</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity style={styles.fabMenuItem} onPress={handleOpenSearch}>
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <Text style={styles.fabMenuText}>Drive を検索</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fabMenuItem} onPress={handleLocalFile}>
                <Ionicons name="document-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.fabMenuText}>ローカルファイル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fabMenuItem, styles.fabMenuLogout]}
                onPress={logout}
              >
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
                <Text style={[styles.fabMenuText, { color: colors.error }]}>ログアウト</Text>
              </TouchableOpacity>
            </View>
          )}
          <FAB
            onPress={() => setIsFabOpen(!isFabOpen)}
            isOpen={isFabOpen}
            icon={<Ionicons name="add" size={28} color={colors.bgPrimary} />}
          />
        </>
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
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing.xl,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xl,
  },
  emptyTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: fontSize.base * 1.5,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    marginVertical: spacing.lg,
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

  // FAB Menu
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayLight,
    zIndex: 898,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    minWidth: 220,
    zIndex: 899,
    ...shadows.lg,
  },
  fabUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  fabAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabUserDetails: {
    flex: 1,
  },
  fabUserName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  fabUserEmail: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  fabMenuText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  fabMenuLogout: {
    marginTop: spacing.xs,
  },
});
