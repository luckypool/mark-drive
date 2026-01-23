/**
 * MD Viewer - Viewer Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../src/theme';
import { Card, IconButton } from '../src/components/ui';
import { MarkdownRenderer } from '../src/components/markdown';
import { useGoogleAuth, useShare } from '../src/hooks';
import { addFileToHistory } from '../src/services';

type ViewerParams = {
  id: string;
  name: string;
  content?: string;
  source: 'google-drive' | 'local';
};

export default function ViewerScreen() {
  const params = useLocalSearchParams<ViewerParams>();
  const { fetchFileContent, isLoading: isAuthLoading, isAuthenticated, accessToken } = useGoogleAuth();
  const { shareContent, isProcessing } = useShare();

  const [content, setContent] = useState<string | null>(params.content || null);
  const [isLoading, setIsLoading] = useState(!params.content);
  const [error, setError] = useState<string | null>(null);

  console.log('[ViewerScreen] render - params:', params);
  console.log('[ViewerScreen] isAuthLoading:', isAuthLoading, 'isAuthenticated:', isAuthenticated);
  console.log('[ViewerScreen] accessToken:', accessToken ? 'あり' : 'なし');

  // Google Drive からファイル内容を取得
  useEffect(() => {
    console.log('[ViewerScreen] useEffect triggered');
    console.log('[ViewerScreen] source:', params.source, 'content:', params.content ? 'あり' : 'なし');
    console.log('[ViewerScreen] isAuthLoading:', isAuthLoading, 'accessToken:', accessToken ? 'あり' : 'なし');

    if (params.source === 'google-drive' && !params.content) {
      // トークン復元が完了するまで待つ
      if (isAuthLoading) {
        console.log('[ViewerScreen] 認証ローディング中、待機...');
        return;
      }
      if (!accessToken) {
        console.log('[ViewerScreen] トークンなし、エラー設定');
        setError('認証が必要です。ホームに戻ってログインしてください。');
        setIsLoading(false);
        return;
      }
      console.log('[ViewerScreen] loadFileContent呼び出し');
      loadFileContent();
    }
  }, [params.id, params.source, params.content, isAuthLoading, accessToken]);

  const loadFileContent = async () => {
    console.log('[loadFileContent] 開始');
    setIsLoading(true);
    setError(null);

    try {
      const fileContent = await fetchFileContent(params.id);
      console.log('[loadFileContent] 結果:', fileContent ? `${fileContent.length}文字` : 'null');
      if (fileContent) {
        setContent(fileContent);
        // 履歴に追加
        await addFileToHistory({
          id: params.id,
          name: params.name,
          source: 'google-drive',
        });
      } else {
        setError('ファイルの読み込みに失敗しました');
      }
    } catch (err) {
      console.error('[loadFileContent] エラー:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 共有
  const handleShare = async () => {
    if (content && params.name) {
      await shareContent(content, params.name);
    }
  };

  // 戻る
  const handleBack = () => {
    router.back();
  };

  // リンクを開く
  const handleLinkPress = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons
            name={params.source === 'google-drive' ? 'logo-google' : 'document-outline'}
            size={16}
            color={colors.accent}
          />
          <Text style={styles.fileName} numberOfLines={1}>
            {params.name}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon={
              isProcessing ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Ionicons name="share-outline" size={20} color={colors.textMuted} />
              )
            }
            onPress={handleShare}
            disabled={isProcessing || !content}
          />
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFileContent}>
            <Text style={styles.retryText}>再試行</Text>
          </TouchableOpacity>
        </View>
      ) : content ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.contentCard}>
            <MarkdownRenderer content={content} onLinkPress={handleLinkPress} />
          </Card>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>コンテンツがありません</Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgSecondary,
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fileName: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.accent,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.base,
    color: colors.textMuted,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  retryText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textMuted,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  contentCard: {
    padding: spacing.lg,
  },
});
