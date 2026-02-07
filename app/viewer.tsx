/**
 * MD Viewer - Viewer Screen
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight } from '../src/theme';
import { Button } from '../src/components/ui';
import { MarkdownRenderer } from '../src/components/markdown';
import { useGoogleAuth, useShare, useTheme, useLanguage, useMarkdownEditor } from '../src/hooks';
import { useFontSettings, fontSizeMultipliers, fontFamilyStacks, FontSize, FontFamily } from '../src/contexts/FontSettingsContext';
import { addFileToHistory } from '../src/services';

type ViewerParams = {
  id: string;
  name: string;
  content?: string;
  source: 'google-drive' | 'local';
};

export default function ViewerScreen() {
  const { colors, mode: themeMode, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { settings: fontSettings, setFontSize, setFontFamily } = useFontSettings();
  const params = useLocalSearchParams<ViewerParams>();
  const { fetchFileContent, isLoading: isAuthLoading, isAuthenticated, accessToken } = useGoogleAuth();
  const { shareContent, isProcessing } = useShare();

  const [content, setContent] = useState<string | null>(params.content || null);

  const editor = useMarkdownEditor({
    initialContent: content,
    fileId: params.id,
    source: params.source as 'google-drive' | 'local',
    accessToken,
    onContentSaved: (newContent) => setContent(newContent),
  });
  const [isLoading, setIsLoading] = useState(!params.content);
  const [error, setError] = useState<string | null>(null);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const hideHeaderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Fullscreen mode handlers
  const enterFullscreen = useCallback(async () => {
    setIsFullscreen(true);
    setShowHeader(false);

    // Use Fullscreen API on supported platforms (Android Chrome, Desktop)
    if (Platform.OS === 'web' && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {
        // Fullscreen API not supported or blocked, continue with header-hide mode
      }
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    setIsFullscreen(false);
    setShowHeader(true);

    if (Platform.OS === 'web' && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (e) {
        // Ignore errors
      }
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Handle content tap in fullscreen mode
  const handleContentTap = useCallback(() => {
    if (!isFullscreen) return;

    // Clear existing timeout
    if (hideHeaderTimeout.current) {
      clearTimeout(hideHeaderTimeout.current);
    }

    if (showHeader) {
      // Hide header
      Animated.timing(headerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowHeader(false));
    } else {
      // Show header
      setShowHeader(true);
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 3 seconds
      hideHeaderTimeout.current = setTimeout(() => {
        if (isFullscreen) {
          Animated.timing(headerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setShowHeader(false));
        }
      }, 3000);
    }
  }, [isFullscreen, showHeader, headerOpacity]);

  // Listen for fullscreen change events (e.g., user presses Escape)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        setShowHeader(true);
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, headerOpacity]);

  // Keyboard shortcut: F to toggle fullscreen
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';

      // Ctrl+S / Cmd+S: 編集モード時に保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (editor.mode === 'edit' && editor.canSave) {
          e.preventDefault();
          editor.save();
        } else if (editor.mode === 'edit') {
          e.preventDefault();
        }
        return;
      }

      if (isTyping) return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }

      // E: 編集モードをトグル
      if ((e.key === 'e' || e.key === 'E') && editor.canEdit) {
        e.preventDefault();
        if (editor.hasUnsavedChanges) {
          const confirmed = window.confirm(t.viewer.unsavedChanges);
          if (!confirmed) return;
        }
        editor.toggleMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, editor, t.viewer.unsavedChanges]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideHeaderTimeout.current) {
        clearTimeout(hideHeaderTimeout.current);
      }
    };
  }, []);

  // beforeunload で未保存変更を警告
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editor.hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editor.hasUnsavedChanges]);

  const handleDownloadPdf = async () => {
    if (content && params.name) {
      setShowFileInfo(false);
      await shareContent(content, params.name);
    }
  };

  const handleBack = () => {
    if (editor.hasUnsavedChanges) {
      const confirmed = window.confirm(t.viewer.unsavedChanges);
      if (!confirmed) return;
    }
    router.back();
  };

  const handleLinkPress = (url: string) => {
    window.open(url, '_blank');
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      edges={isFullscreen ? [] : ['top']}
    >
      {/* Header */}
      {(!isFullscreen || showHeader) && (
        <Animated.View
          style={[
            styles.header,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.bgSecondary,
              opacity: isFullscreen ? headerOpacity : 1,
            },
            isFullscreen && styles.fullscreenHeader,
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={isFullscreen ? exitFullscreen : handleBack}>
            <Ionicons
              name={isFullscreen ? "close" : "chevron-back"}
              size={28}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerTitle}
            onPress={() => setShowFileInfo(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
              {params.name}
            </Text>
            {editor.hasUnsavedChanges && (
              <View style={[styles.unsavedDot, { backgroundColor: '#f59e0b' }]} />
            )}
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {editor.canEdit && (
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={() => {
                  if (editor.mode === 'edit' && editor.hasUnsavedChanges) {
                    const confirmed = window.confirm(t.viewer.unsavedChanges);
                    if (!confirmed) return;
                  }
                  editor.toggleMode();
                }}
              >
                <Ionicons
                  name={editor.mode === 'preview' ? 'create-outline' : 'eye-outline'}
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            )}
            {editor.mode === 'edit' && (
              <TouchableOpacity
                style={[styles.headerActionButton, { opacity: editor.canSave ? 1 : 0.4 }]}
                onPress={() => editor.save()}
                disabled={!editor.canSave}
              >
                <Ionicons
                  name="save-outline"
                  size={24}
                  color={editor.canSave ? colors.accent : colors.textMuted}
                />
              </TouchableOpacity>
            )}
            {editor.mode === 'preview' && (
              <TouchableOpacity style={styles.headerActionButton} onPress={toggleFullscreen}>
                <Ionicons
                  name={isFullscreen ? "contract-outline" : "expand-outline"}
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

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
      ) : content || editor.mode === 'edit' ? (
        editor.mode === 'edit' ? (
          <View style={styles.editorContainer}>
            {/* Editor Status Bar */}
            {(editor.saveSuccess || editor.saveError || editor.needsReauth || editor.isSaving) && (
              <View
                style={[
                  styles.editorStatusBar,
                  {
                    backgroundColor: editor.saveError || editor.needsReauth
                      ? colors.error + '18'
                      : editor.saveSuccess
                      ? colors.accent + '18'
                      : colors.bgTertiary,
                  },
                ]}
              >
                <Text
                  style={{
                    color: editor.saveError || editor.needsReauth
                      ? colors.error
                      : editor.saveSuccess
                      ? colors.accent
                      : colors.textMuted,
                    fontSize: fontSize.sm,
                  }}
                >
                  {editor.isSaving
                    ? t.viewer.saving
                    : editor.needsReauth
                    ? t.viewer.reauthRequired
                    : editor.saveError
                    ? `${t.viewer.saveFailed}: ${editor.saveError}`
                    : editor.saveSuccess
                    ? t.viewer.saved
                    : ''}
                </Text>
              </View>
            )}
            <TextInput
              style={[
                styles.editorTextarea,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.bgPrimary,
                  fontSize: fontSize.base * fontSizeMultipliers[fontSettings.fontSize],
                  fontFamily: fontFamilyStacks[fontSettings.fontFamily],
                },
              ]}
              value={editor.editContent}
              onChangeText={editor.setEditContent}
              multiline
              autoFocus
              textAlignVertical="top"
              spellCheck={false}
              autoCorrect={false}
            />
          </View>
        ) : (
          <Pressable
            style={styles.contentPressable}
            onPress={handleContentTap}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                isFullscreen && styles.fullscreenContent,
              ]}
              showsVerticalScrollIndicator={!isFullscreen}
            >
              <View style={isFullscreen ? [styles.contentContainer, styles.fullscreenCard] : styles.contentContainer}>
                <MarkdownRenderer content={content!} onLinkPress={handleLinkPress} themeMode={themeMode} />
              </View>
            </ScrollView>
          </Pressable>
        )
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t.viewer.noContent}</Text>
        </View>
      )}

      {/* File Info Dialog */}
      <Modal
        visible={showFileInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFileInfo(false)}
      >
        <Pressable style={styles.dialogOverlay} onPress={() => setShowFileInfo(false)}>
          <Pressable
            style={[styles.dialogPanel, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <View style={[styles.dialogHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>
                {t.fileInfo.title}
              </Text>
              <TouchableOpacity onPress={() => setShowFileInfo(false)} style={styles.dialogClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* File Info */}
            <View style={[styles.dialogSection, { borderBottomColor: colors.border }]}>
              <View style={styles.fileInfoRow}>
                <Ionicons
                  name={params.source === 'google-drive' ? 'logo-google' : 'document-outline'}
                  size={20}
                  color={colors.accent}
                />
                <Text style={[styles.fileInfoName, { color: colors.textPrimary }]}>
                  {params.name}
                </Text>
              </View>
              <View style={styles.fileInfoRow}>
                <Text style={[styles.fileInfoLabel, { color: colors.textMuted }]}>
                  {t.fileInfo.source}:
                </Text>
                <Text style={[styles.fileInfoValue, { color: colors.textSecondary }]}>
                  {params.source === 'google-drive' ? t.fileInfo.googleDrive : t.fileInfo.local}
                </Text>
              </View>
            </View>

            {/* Display Settings */}
            <View style={styles.dialogSection}>
              <Text style={[styles.dialogSectionTitle, { color: colors.textMuted }]}>
                {t.menu.display}
              </Text>

              {/* Font Size */}
              <View style={styles.dialogSettingRow}>
                <Text style={[styles.dialogSettingLabel, { color: colors.textPrimary }]}>
                  {t.fontSettings.fontSize}
                </Text>
                <View style={styles.dialogSettingOptions}>
                  {fontSizeOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dialogOption,
                        {
                          backgroundColor: fontSettings.fontSize === option.value ? colors.accentMuted : colors.bgTertiary,
                        }
                      ]}
                      onPress={() => setFontSize(option.value)}
                    >
                      <Text style={[
                        styles.dialogOptionText,
                        { color: fontSettings.fontSize === option.value ? colors.accent : colors.textSecondary }
                      ]}>
                        {fontSizeLabels[option.labelKey]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Font Family */}
              <View style={styles.dialogSettingRow}>
                <Text style={[styles.dialogSettingLabel, { color: colors.textPrimary }]}>
                  {t.fontSettings.fontFamily}
                </Text>
                <View style={styles.dialogSettingOptions}>
                  {fontFamilyOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dialogOption,
                        {
                          backgroundColor: fontSettings.fontFamily === option.value ? colors.accentMuted : colors.bgTertiary,
                        }
                      ]}
                      onPress={() => setFontFamily(option.value)}
                    >
                      <Text style={[
                        styles.dialogOptionText,
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
            <View style={styles.dialogSection}>
              <Text style={[styles.dialogSectionTitle, { color: colors.textMuted }]}>
                {t.settings.theme}
              </Text>
              <View style={styles.dialogSettingOptions}>
                <TouchableOpacity
                  style={[
                    styles.dialogOption,
                    styles.dialogOptionWide,
                    { backgroundColor: themeMode === 'light' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setTheme('light')}
                >
                  <Ionicons name="sunny-outline" size={18} color={themeMode === 'light' ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.dialogOptionText, { color: themeMode === 'light' ? colors.accent : colors.textSecondary }]}>
                    {t.settings.light}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dialogOption,
                    styles.dialogOptionWide,
                    { backgroundColor: themeMode === 'dark' ? colors.accentMuted : colors.bgTertiary }
                  ]}
                  onPress={() => setTheme('dark')}
                >
                  <Ionicons name="moon-outline" size={18} color={themeMode === 'dark' ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.dialogOptionText, { color: themeMode === 'dark' ? colors.accent : colors.textSecondary }]}>
                    {t.settings.dark}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* PDF Export */}
            <View style={[styles.dialogSection, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <Button
                onPress={handleDownloadPdf}
                disabled={isProcessing || !content}
                loading={isProcessing}
                icon={<Ionicons name="download-outline" size={20} color={colors.bgPrimary} />}
                style={styles.pdfButton}
              >
                {t.fileInfo.exportPdf}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  fileName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    maxWidth: '80%',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsavedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fullscreenHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
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
  contentPressable: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  fullscreenContent: {
    paddingTop: spacing['2xl'],
  },
  contentContainer: {
  },
  fullscreenCard: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },

  // Editor
  editorContainer: {
    flex: 1,
  },
  editorStatusBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editorTextarea: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },

  // Dialog
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialogPanel: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  dialogTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  dialogClose: {
    padding: spacing.xs,
  },
  dialogSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  dialogSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  fileInfoName: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  fileInfoLabel: {
    fontSize: fontSize.sm,
  },
  fileInfoValue: {
    fontSize: fontSize.sm,
  },
  dialogSettingRow: {
    marginBottom: spacing.md,
  },
  dialogSettingLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  dialogSettingOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dialogOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogOptionWide: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dialogOptionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  pdfButton: {
    width: '100%',
  },
});
