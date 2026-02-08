/**
 * MarkDrive - About Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight } from '../src/theme';
import { useTheme, useLanguage } from '../src/hooks';
import { ThemeToggle, LanguageToggle } from '../src/components/ui';

export default function AboutScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bgSecondary }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t.about.title}</Text>
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
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.heroIcon}
            resizeMode="contain"
          />
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{t.about.appName}</Text>
          <Text style={[styles.heroVersion, { color: colors.textMuted }]}>{t.about.version.replace('{version}', '2.0.0')}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.about.whatIs}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t.about.description}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.about.features}</Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accentMuted }]}>
                <Ionicons name="logo-google" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{t.about.feature.drive.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {t.about.feature.drive.desc}
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accentMuted }]}>
                <Ionicons name="code-slash-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{t.about.feature.syntax.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {t.about.feature.syntax.desc}
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accentMuted }]}>
                <Ionicons name="git-network-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{t.about.feature.mermaid.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {t.about.feature.mermaid.desc}
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accentMuted }]}>
                <Ionicons name="document-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{t.about.feature.pdf.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {t.about.feature.pdf.desc}
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accentMuted }]}>
                <Ionicons name="folder-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{t.about.feature.local.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {t.about.feature.local.desc}
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accentMuted }]}>
                <Ionicons name="time-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{t.about.feature.recent.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {t.about.feature.recent.desc}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Supported Formats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.about.supported}</Text>
          <View style={styles.chipContainer}>
            {[
              t.about.chips.headers,
              t.about.chips.boldItalic,
              t.about.chips.lists,
              t.about.chips.tables,
              t.about.chips.codeBlocks,
              t.about.chips.links,
              t.about.chips.images,
              t.about.chips.blockquotes,
              t.about.chips.taskLists,
              t.about.chips.strikethrough,
              t.about.chips.mermaid,
              t.about.chips.gfm,
            ].map((label) => (
              <View key={label} style={[styles.chip, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
                <Text style={[styles.chipText, { color: colors.textSecondary }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.about.privacy}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t.about.privacyDesc}
          </Text>
        </View>

        {/* License */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.about.license}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t.about.licenseDesc}
          </Text>
          <View style={styles.licenseButtons}>
            <TouchableOpacity
              style={[styles.licenseButton, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}
              onPress={() => router.push('/license')}
            >
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.licenseButtonText, { color: colors.textSecondary }]}>{t.about.viewLicense}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.licenseButton, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}
              onPress={() => router.push('/third-party-licenses')}
            >
              <Ionicons name="library-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.licenseButtonText, { color: colors.textSecondary }]}>{t.about.viewThirdPartyLicenses}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.licenseButton, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}
              onPress={() => router.push('/terms')}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.licenseButtonText, { color: colors.textSecondary }]}>{t.about.viewTerms}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.licenseButton, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}
              onPress={() => router.push('/privacy')}
            >
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.licenseButtonText, { color: colors.textSecondary }]}>{t.about.viewPrivacy}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            {t.about.footer}
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

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
  },
  heroTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
  },
  heroVersion: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },

  // Sections
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.6,
  },

  // Feature List
  featureList: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: fontSize.sm,
  },

  // License Buttons
  licenseButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  licenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  licenseButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // Footer
  footer: {
    marginTop: spacing['2xl'],
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
  },
});
