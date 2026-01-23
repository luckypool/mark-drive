/**
 * Markdown レンダラー - Native 版
 * react-native-markdown-display を使用
 */

import React from 'react';
import { StyleSheet, Linking, ScrollView, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import type { MarkdownRendererProps } from '../../types/markdown';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

export function MarkdownRenderer({ content, onLinkPress }: MarkdownRendererProps) {
  const handleLinkPress = (url: string) => {
    if (onLinkPress) {
      onLinkPress(url);
    } else {
      Linking.openURL(url);
    }
    return true;
  };

  // カスタムルール: テーブルを水平スクロール可能にする
  const rules = {
    table: (
      node: { key: string },
      children: React.ReactNode,
      _parent: unknown,
      styles: Record<string, object>
    ) => (
      <ScrollView
        key={node.key}
        horizontal
        showsHorizontalScrollIndicator={true}
        style={tableWrapperStyles.wrapper}
        contentContainerStyle={tableWrapperStyles.content}
      >
        <View style={styles.table}>{children}</View>
      </ScrollView>
    ),
  };

  return (
    <Markdown style={markdownStyles} onLinkPress={handleLinkPress} rules={rules}>
      {content}
    </Markdown>
  );
}

const tableWrapperStyles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.md,
  },
  content: {
    flexGrow: 1,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.6,
  },

  // Headings
  heading1: {
    color: colors.textPrimary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderLight,
  },
  heading2: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heading3: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading4: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heading5: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heading6: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  // Paragraph
  paragraph: {
    marginBottom: spacing.md,
    lineHeight: fontSize.base * 1.6,
  },

  // Links
  link: {
    color: colors.accent,
    textDecorationLine: 'none',
  },

  // Strong / Bold
  strong: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },

  // Emphasis / Italic
  em: {
    fontStyle: 'italic',
  },

  // Lists
  bullet_list: {
    marginBottom: spacing.md,
  },
  ordered_list: {
    marginBottom: spacing.md,
  },
  list_item: {
    marginBottom: spacing.xs,
    flexDirection: 'row',
  },
  bullet_list_icon: {
    color: colors.accent,
    marginRight: spacing.sm,
  },
  ordered_list_icon: {
    color: colors.accent,
    marginRight: spacing.sm,
  },

  // Blockquote
  blockquote: {
    backgroundColor: colors.accentMuted,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderTopRightRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },

  // Code - インライン
  code_inline: {
    backgroundColor: colors.accentMuted,
    color: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
  },
  // Indented コードブロック (4スペース) - シンプルなスタイル
  code_block: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  // Fence コードブロック - 濃い背景色でハイライト風
  fence: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    color: '#e6edf3',
  },

  // Horizontal Rule
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.xl,
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  thead: {
    backgroundColor: colors.bgTertiary,
  },
  th: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    padding: spacing.sm,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  td: {
    padding: spacing.sm,
    borderRightWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },

  // Image
  image: {
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },

  // Task list
  textgroup: {},
  hardbreak: {
    height: spacing.md,
  },
  softbreak: {
    height: spacing.sm,
  },
});
