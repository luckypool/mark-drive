/**
 * MD Viewer - About Screen
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
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../src/theme';

export default function AboutScreen() {
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About MD Viewer</Text>
        <View style={styles.headerSpacer} />
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
          <Text style={styles.heroTitle}>MD Viewer</Text>
          <Text style={styles.heroVersion}>Version 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is MD Viewer?</Text>
          <Text style={styles.sectionText}>
            MD Viewer is a web application that beautifully renders Markdown files
            stored in your Google Drive. It provides a seamless reading experience
            with syntax highlighting, diagram support, and PDF export capabilities.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="logo-google" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Google Drive Integration</Text>
                <Text style={styles.featureDescription}>
                  Connect your Google account and search for Markdown files
                  directly from your Drive. Quick access to your documents
                  without downloading.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="code-slash-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Syntax Highlighting</Text>
                <Text style={styles.featureDescription}>
                  Code blocks are rendered with syntax highlighting for
                  various programming languages including JavaScript, Python,
                  TypeScript, and more.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="git-network-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Mermaid Diagrams</Text>
                <Text style={styles.featureDescription}>
                  Create flowcharts, sequence diagrams, and other visualizations
                  using Mermaid syntax. Diagrams are rendered automatically
                  within your documents.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="document-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>PDF Export</Text>
                <Text style={styles.featureDescription}>
                  Export your rendered Markdown documents as PDF files.
                  Perfect for sharing documentation or creating printable
                  versions of your notes.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="folder-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Local File Support</Text>
                <Text style={styles.featureDescription}>
                  Open Markdown files from your local device without signing in.
                  Great for quick previews or when working offline.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="time-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Recent Files</Text>
                <Text style={styles.featureDescription}>
                  Quick access to recently viewed files. Your reading history
                  is stored locally for convenience.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Supported Formats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Markdown Features</Text>
          <View style={styles.chipContainer}>
            <View style={styles.chip}><Text style={styles.chipText}>Headers</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Bold / Italic</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Lists</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Tables</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Code Blocks</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Links</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Images</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Blockquotes</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Task Lists</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Strikethrough</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Mermaid</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>GFM</Text></View>
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <Text style={styles.sectionText}>
            MD Viewer only requests read-only access to your Google Drive files.
            Your documents are never stored on our servers - they are fetched
            directly from Google Drive and rendered in your browser.
            Your authentication tokens are stored securely in your browser's
            local storage.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with Expo and React Native Web
          </Text>
        </View>
      </ScrollView>
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
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
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
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  heroVersion: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Sections
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
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
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.5,
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  // Footer
  footer: {
    marginTop: spacing['2xl'],
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
