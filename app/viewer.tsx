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
import { spacing, borderRadius, fontSize, fontWeight } from '../src/theme';
import { Card, ThemeToggle, LanguageToggle } from '../src/components/ui';
import { MarkdownRenderer } from '../src/components/markdown';
import { useGoogleAuth, useShare, useTheme, useLanguage } from '../src/hooks';
import { addFileToHistory } from '../src/services';

type ViewerParams = {
  id: string;
  name: string;
  content?: string;
  source: 'google-drive' | 'local';
};

export default function ViewerScreen() {
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams<ViewerParams>();
  const { fetchFileContent, isLoading: isAuthLoading, isAuthenticated, accessToken } = useGoogleAuth();
  const { shareContent, isProcessing } = useShare();

  const [content, setContent] = useState<string | null>(params.content || null);
  const [isLoading, setIsLoading] = useState(!params.content);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.source === 'google-drive' && !params.content) {
      if (isAuthLoading) {
        return;
      }
      if (!accessToken) {
        setError(t.viewer.authRequired);
        setIsLoading(false);
        return;
      }
      loadFileContent();
    }
  }, [params.id, params.source, params.content, isAuthLoading, accessToken, t.viewer.authRequired]);

  const loadFileContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fileContent = await fetchFileContent(params.id);
      if (fileContent) {
        setContent(fileContent);
        await addFileToHistory({
          id: params.id,
          name: params.name,
          source: 'google-drive',
        });
      } else {
        setError(t.viewer.loadFailed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.viewer.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (content && params.name) {
      await shareContent(content, params.name);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleLinkPress = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bgSecondary }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons
            name={params.source === 'google-drive' ? 'logo-google' : 'document-outline'}
            size={16}
            color={colors.accent}
          />
          <Text style={[styles.fileName, { color: colors.accent }]} numberOfLines={1}>
            {params.name}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <LanguageToggle />
          <ThemeToggle />
          <TouchableOpacity
            style={[
              styles.pdfButton,
              { backgroundColor: colors.accent },
              (isProcessing || !content) && styles.pdfButtonDisabled,
            ]}
            onPress={handleDownloadPdf}
            disabled={isProcessing || !content}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={colors.bgPrimary} />
            ) : (
              <>
                <Ionicons name="download-outline" size={16} color={colors.bgPrimary} />
                <Text style={[styles.pdfButtonText, { color: colors.bgPrimary }]}>PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t.viewer.loading}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}
            onPress={loadFileContent}
          >
            <Text style={[styles.retryText, { color: colors.textPrimary }]}>{t.viewer.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : content ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.contentCard}>
            <MarkdownRenderer content={content} onLinkPress={handleLinkPress} themeMode={mode} />
          </Card>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t.viewer.noContent}</Text>
        </View>
      )}
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
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  pdfButtonDisabled: {
    opacity: 0.5,
  },
  pdfButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
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
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  retryText: {
    fontSize: fontSize.base,
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
