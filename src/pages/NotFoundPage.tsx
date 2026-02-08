import { Link } from 'react-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks';
import { spacing, fontSize, fontWeight } from '../theme';

export default function NotFoundPage() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Page Not Found</Text>
      <Link to="/" style={{ marginTop: spacing.md }}>
        <Text style={[styles.linkText, { color: colors.accent }]}>Go to Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.lg,
  },
  linkText: {
    fontSize: fontSize.base,
  },
});
