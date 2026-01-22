import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'ページが見つかりません' }} />
      <View style={styles.container}>
        <Text style={styles.title}>ページが見つかりません</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>ホームに戻る</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bgPrimary,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  link: {
    marginTop: spacing.md,
  },
  linkText: {
    fontSize: fontSize.base,
    color: colors.accent,
  },
});
