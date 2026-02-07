/**
 * CodeMirrorEditor - CodeMirror 6 based Markdown editor with syntax highlighting
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap } from '@codemirror/search';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { useTheme } from '../../hooks/useTheme';
import { useFontSettings, fontSizeMultipliers } from '../../contexts/FontSettingsContext';
import { spacing, borderRadius, fontSize as themeFontSize } from '../../theme';

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  autoFocus?: boolean;
}

export function CodeMirrorEditor({ value, onChange, onSave, autoFocus }: CodeMirrorEditorProps) {
  const { colors, mode } = useTheme();
  const { settings: fontSettings } = useFontSettings();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);

  // Keep refs up to date
  onChangeRef.current = onChange;
  onSaveRef.current = onSave;

  // Recreate editor when theme or font settings change
  useEffect(() => {
    if (!editorRef.current) return;

    const computedFontSize = themeFontSize.base * fontSizeMultipliers[fontSettings.fontSize];

    const highlightStyle = HighlightStyle.define([
      { tag: tags.heading1, color: colors.accent, fontWeight: 'bold' },
      { tag: tags.heading2, color: colors.accent, fontWeight: 'bold' },
      { tag: tags.heading3, color: colors.accent },
      { tag: tags.heading4, color: colors.accent },
      { tag: tags.heading5, color: colors.accent },
      { tag: tags.heading6, color: colors.accent },
      { tag: tags.emphasis, fontStyle: 'italic', color: colors.textSecondary },
      { tag: tags.strong, fontWeight: 'bold', color: colors.warning },
      { tag: tags.link, color: colors.accent, textDecoration: 'underline' },
      { tag: tags.url, color: colors.accent, textDecoration: 'underline' },
      { tag: tags.monospace, color: colors.warning, backgroundColor: colors.bgTertiary },
      { tag: tags.quote, color: colors.textMuted, fontStyle: 'italic' },
      { tag: tags.meta, color: colors.textMuted },
      { tag: tags.processingInstruction, color: colors.textMuted },
    ]);

    const customTheme = EditorView.theme({
      '&': {
        backgroundColor: colors.bgSecondary,
        color: colors.textPrimary,
        fontSize: `${computedFontSize}px`,
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
        flex: '1',
        height: '100%',
      },
      '.cm-content': {
        padding: `${spacing.md}px`,
        caretColor: colors.accent,
        lineHeight: '1.7',
      },
      '.cm-gutters': {
        backgroundColor: colors.bgTertiary,
        color: colors.textMuted,
        border: 'none',
      },
      '.cm-activeLineGutter': {
        backgroundColor: colors.accentMuted,
      },
      '.cm-activeLine': {
        backgroundColor: colors.accentMuted,
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: colors.accent,
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
        backgroundColor: `${colors.accent}30`,
      },
      '.cm-scroller': {
        overflow: 'auto',
        flex: '1',
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
      },
      '&.cm-focused': {
        outline: 'none',
      },
    });

    // Preserve current document content if view exists
    const currentContent = viewRef.current
      ? viewRef.current.state.doc.toString()
      : value;

    // Destroy previous view
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const extensions = [
      customTheme,
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(highlightStyle),
      history(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        {
          key: 'Mod-s',
          run: () => {
            onSaveRef.current?.();
            return true;
          },
        },
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
      EditorView.lineWrapping,
      EditorState.tabSize.of(2),
    ];

    const state = EditorState.create({
      doc: currentContent,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    if (autoFocus) {
      view.focus();
    }

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [mode, fontSettings.fontSize, colors]);

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.border,
          borderLeftColor: colors.accent,
        },
      ]}
    >
      <div ref={editorRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: spacing.sm,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
});
