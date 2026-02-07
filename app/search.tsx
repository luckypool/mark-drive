/**
 * MarkDrive - Search Screen
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight } from '../src/theme';
import { GoogleLogo } from '../src/components/ui';
import { useGoogleAuth, useTheme, useLanguage } from '../src/hooks';
import type { DriveFile } from '../src/types';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const {
    isLoading,
    isAuthenticated,
    results,
    recentFiles,
    search,
    loadRecentFiles,
    authenticate,
    clearResults,
  } = useGoogleAuth();

  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      // 認証済みなら最近のファイルを自動取得
      loadRecentFiles();
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loadRecentFiles]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.length >= 2) {
        search(text);
      } else {
        clearResults();
      }
    },
    [search, clearResults]
  );

  const handleSelectFile = useCallback((file: DriveFile) => {
    router.replace({
      pathname: '/viewer',
      params: {
        id: file.id,
        name: file.name,
        source: 'google-drive',
      },
    });
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 30) return date.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US');
    if (days > 0) return t.common.daysAgo.replace('{days}', String(days));
    if (hours > 0) return t.common.hoursAgo.replace('{hours}', String(hours));
    if (minutes > 0) return t.common.minutesAgo.replace('{min}', String(minutes));
    return t.common.justNow;
  };

  const formatFileSize = (sizeString?: string): string => {
    if (!sizeString) return '';
    const bytes = parseInt(sizeString, 10);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderResultItem = useCallback(
    ({ item }: { item: DriveFile }) => (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleSelectFile(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.resultIcon, { backgroundColor: colors.accentMuted }]}>
          <Ionicons name="document-text-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.resultContent}>
          <Text style={[styles.resultName, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.resultMeta}>
            {item.modifiedTime && (
              <Text style={[styles.resultMetaText, { color: colors.textMuted }]}>
                {formatRelativeTime(item.modifiedTime)}
              </Text>
            )}
            {item.size && (
              <Text style={[styles.resultMetaText, { color: colors.textMuted }]}>
                {formatFileSize(item.size)}
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    ),
    [handleSelectFile, colors]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Search Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={t.search.placeholder}
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              editable={isAuthenticated}
              onKeyPress={(e) => {
                if (e.nativeEvent.key === 'Escape') {
                  handleClose();
                }
              }}
            />
            {isLoading && <ActivityIndicator size="small" color={colors.accent} />}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Search Body - tap outside to close */}
        <Pressable style={styles.body} onPress={handleClose}>
          {!isAuthenticated ? (
            <View style={styles.authPrompt}>
              <Text style={[styles.authText, { color: colors.textSecondary }]}>
                {t.search.signInPrompt}
              </Text>
              <TouchableOpacity style={[styles.authButton, { backgroundColor: '#ffffff', borderColor: '#dadce0', borderWidth: 1 }]} onPress={authenticate}>
                <GoogleLogo size={20} />
                <Text style={[styles.authButtonText, { color: '#3c4043', fontFamily: Platform.OS === 'web' ? "'Roboto', sans-serif" : undefined, fontWeight: '500' }]}>{t.search.signIn}</Text>
              </TouchableOpacity>
            </View>
          ) : query.length === 0 ? (
            recentFiles.length > 0 ? (
              <FlatList
                data={recentFiles}
                keyExtractor={(item) => item.id}
                renderItem={renderResultItem}
                contentContainerStyle={styles.resultsList}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <View style={styles.recentHeader}>
                    <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>
                      {t.search.recentTitle}
                    </Text>
                    <Text style={[styles.recentHint, { color: colors.textMuted }]}>
                      {t.search.recentHint}
                    </Text>
                  </View>
                }
              />
            ) : isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="document-outline" size={48} color={colors.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>{t.search.noRecentFiles}</Text>
                <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                  {t.search.emptyHint}
                </Text>
              </View>
            )
          ) : query.length < 2 ? (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, { color: colors.textSecondary }]}>{t.search.minChars}</Text>
            </View>
          ) : results.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="document-outline" size={48} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>{t.search.noResults}</Text>
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                {t.search.noResultsHint}
              </Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderResultItem}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                results.length > 0 ? (
                  <Text style={[styles.resultsHeader, { color: colors.textMuted }]}>
                    {results.length === 1
                      ? t.search.resultCount.replace('{count}', '1')
                      : t.search.resultsCount.replace('{count}', String(results.length))}
                  </Text>
                ) : null
              }
            />
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.lg,
    paddingVertical: spacing.xs,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Body
  body: {
    flex: 1,
  },

  // Auth Prompt
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  authText: {
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: fontSize.base * 1.5,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  authButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  emptyHint: {
    fontSize: fontSize.sm,
  },

  // Privacy Notice
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
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

  // Message
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  messageText: {
    fontSize: fontSize.base,
  },

  // Recent Files Header
  recentHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  recentTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  recentHint: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },

  // Results
  resultsList: {
    padding: spacing.sm,
  },
  resultsHeader: {
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  resultMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  resultMetaText: {
    fontSize: fontSize.sm,
  },
});
