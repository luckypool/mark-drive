/**
 * MD Viewer - Search Screen
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../src/theme';
import { useGoogleAuth } from '../src/hooks';
import type { DriveFile } from '../src/types';

export default function SearchScreen() {
  const {
    isLoading,
    isAuthenticated,
    results,
    search,
    authenticate,
    clearResults,
  } = useGoogleAuth();

  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  // 画面表示時に入力欄にフォーカス
  useEffect(() => {
    console.log('[SearchScreen] フォーカス useEffect - isAuthenticated:', isAuthenticated);
    console.log('[SearchScreen] inputRef.current:', inputRef.current);
    if (isAuthenticated) {
      // 少し遅延させてフォーカス（モーダルアニメーション後）
      const timer = setTimeout(() => {
        console.log('[SearchScreen] フォーカス実行, inputRef:', inputRef.current);
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // 検索を実行
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

  // ファイルを選択
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

  // 閉じる
  const handleClose = useCallback(() => {
    router.back();
  }, []);

  // 相対時間を計算
  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 30) return date.toLocaleDateString('ja-JP');
    if (days > 0) return `${days}日前`;
    if (hours > 0) return `${hours}時間前`;
    if (minutes > 0) return `${minutes}分前`;
    return 'たった今';
  };

  // ファイルサイズをフォーマット
  const formatFileSize = (sizeString?: string): string => {
    if (!sizeString) return '';
    const bytes = parseInt(sizeString, 10);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 検索結果のアイテムをレンダリング
  const renderResultItem = useCallback(
    ({ item }: { item: DriveFile }) => (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleSelectFile(item)}
        activeOpacity={0.7}
      >
        <View style={styles.resultIcon}>
          <Ionicons name="document-text-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.resultMeta}>
            {item.modifiedTime && (
              <Text style={styles.resultMetaText}>
                {formatRelativeTime(item.modifiedTime)}
              </Text>
            )}
            {item.size && (
              <Text style={styles.resultMetaText}>
                {formatFileSize(item.size)}
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    ),
    [handleSelectFile]
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Search Header */}
        <View style={styles.header}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Google Drive を検索..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              editable={isAuthenticated}
            />
            {isLoading && <ActivityIndicator size="small" color={colors.accent} />}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Search Body */}
        <View style={styles.body}>
          {!isAuthenticated ? (
            <View style={styles.authPrompt}>
              <Text style={styles.authText}>
                Google Drive を検索するには{'\n'}ログインしてください
              </Text>
              <TouchableOpacity style={styles.authButton} onPress={authenticate}>
                <Ionicons name="logo-google" size={20} color={colors.bgPrimary} />
                <Text style={styles.authButtonText}>Google でログイン</Text>
              </TouchableOpacity>
            </View>
          ) : query.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Markdown ファイルを検索</Text>
              <Text style={styles.emptyHint}>
                2文字以上入力すると検索が開始されます
              </Text>
            </View>
          ) : query.length < 2 ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>2文字以上入力してください</Text>
            </View>
          ) : results.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="document-outline" size={48} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>結果が見つかりません</Text>
              <Text style={styles.emptyHint}>
                別のキーワードで検索してみてください
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
                  <Text style={styles.resultsHeader}>
                    {results.length} 件の結果
                  </Text>
                ) : null
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
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
    borderBottomColor: colors.border,
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
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.base * 1.5,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  authButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.bgPrimary,
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
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
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
    color: colors.textSecondary,
  },

  // Results
  resultsList: {
    padding: spacing.sm,
  },
  resultsHeader: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
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
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  resultMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  resultMetaText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
