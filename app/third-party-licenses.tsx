/**
 * MarkDrive - Third-Party Licenses Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight } from '../src/theme';
import { useTheme, useLanguage } from '../src/hooks';
import { ThemeToggle, LanguageToggle } from '../src/components/ui';

interface LibraryInfo {
  name: string;
  version: string;
  license: string;
  url: string;
  author?: string;
}

const LIBRARIES: LibraryInfo[] = [
  {
    name: 'React',
    version: '19.1.0',
    license: 'MIT',
    url: 'https://github.com/facebook/react',
    author: 'Meta Platforms, Inc.',
  },
  {
    name: 'React Native',
    version: '0.81.5',
    license: 'MIT',
    url: 'https://github.com/facebook/react-native',
    author: 'Meta Platforms, Inc.',
  },
  {
    name: 'React Native Web',
    version: '0.21.0',
    license: 'MIT',
    url: 'https://github.com/necolas/react-native-web',
    author: 'Nicolas Gallagher',
  },
  {
    name: 'Expo',
    version: '54.0.32',
    license: 'MIT',
    url: 'https://github.com/expo/expo',
    author: 'Expo',
  },
  {
    name: 'Expo Router',
    version: '6.0.22',
    license: 'MIT',
    url: 'https://github.com/expo/expo/tree/main/packages/expo-router',
    author: 'Expo',
  },
  {
    name: '@expo/vector-icons',
    version: '15.0.3',
    license: 'MIT',
    url: 'https://github.com/expo/vector-icons',
    author: 'Expo',
  },
  {
    name: '@react-navigation/native',
    version: '7.1.8',
    license: 'MIT',
    url: 'https://github.com/react-navigation/react-navigation',
    author: 'React Navigation Contributors',
  },
  {
    name: 'react-markdown',
    version: '10.1.0',
    license: 'MIT',
    url: 'https://github.com/remarkjs/react-markdown',
    author: 'Espen Hovlandsdal',
  },
  {
    name: 'remark-gfm',
    version: '4.0.1',
    license: 'MIT',
    url: 'https://github.com/remarkjs/remark-gfm',
    author: 'Titus Wormer',
  },
  {
    name: 'react-syntax-highlighter',
    version: '16.1.0',
    license: 'MIT',
    url: 'https://github.com/react-syntax-highlighter/react-syntax-highlighter',
    author: 'Conor Hastings',
  },
  {
    name: 'Mermaid',
    version: '11.12.2',
    license: 'MIT',
    url: 'https://github.com/mermaid-js/mermaid',
    author: 'Knut Sveidqvist',
  },
  {
    name: 'html2pdf.js',
    version: '0.14.0',
    license: 'MIT',
    url: 'https://github.com/eKoopmans/html2pdf.js',
    author: 'Erik Koopmans',
  },
  {
    name: 'react-native-safe-area-context',
    version: '5.6.0',
    license: 'MIT',
    url: 'https://github.com/th3rdwave/react-native-safe-area-context',
    author: 'Janic Duplessis',
  },
  {
    name: 'react-native-screens',
    version: '4.16.0',
    license: 'MIT',
    url: 'https://github.com/software-mansion/react-native-screens',
    author: 'Software Mansion',
  },
];

export default function ThirdPartyLicensesScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const handleBack = () => {
    router.back();
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bgSecondary }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t.about.thirdPartyLicenses}</Text>
        <View style={styles.headerActions}>
          <LanguageToggle />
          <ThemeToggle />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t.about.thirdPartyDesc}
        </Text>

        <View style={styles.libraryList}>
          {LIBRARIES.map((lib) => (
            <TouchableOpacity
              key={lib.name}
              style={[styles.libraryCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
              onPress={() => handleOpenUrl(lib.url)}
              activeOpacity={0.7}
            >
              <View style={styles.libraryHeader}>
                <Text style={[styles.libraryName, { color: colors.textPrimary }]}>{lib.name}</Text>
                <View style={[styles.licenseBadge, { backgroundColor: colors.accentMuted }]}>
                  <Text style={[styles.licenseText, { color: colors.accent }]}>{lib.license}</Text>
                </View>
              </View>
              <Text style={[styles.libraryVersion, { color: colors.textMuted }]}>v{lib.version}</Text>
              {lib.author && (
                <Text style={[styles.libraryAuthor, { color: colors.textSecondary }]}>{lib.author}</Text>
              )}
              <View style={styles.linkRow}>
                <Ionicons name="open-outline" size={14} color={colors.accent} />
                <Text style={[styles.linkText, { color: colors.accent }]}>View on GitHub</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.mitNotice, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
          <Text style={[styles.mitNoticeTitle, { color: colors.textPrimary }]}>MIT License</Text>
          <Text style={[styles.mitNoticeText, { color: colors.textSecondary }]}>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:{'\n\n'}
            The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.{'\n\n'}
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
          </Text>
        </View>
      </ScrollView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  description: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.6,
    marginBottom: spacing.xl,
  },
  libraryList: {
    gap: spacing.md,
  },
  libraryCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  libraryName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  licenseBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  licenseText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  libraryVersion: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  libraryAuthor: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  linkText: {
    fontSize: fontSize.sm,
  },
  mitNotice: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  mitNoticeTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  mitNoticeText: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.6,
  },
});
