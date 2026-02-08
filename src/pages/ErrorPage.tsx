import { useRouteError, Link } from 'react-router';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight } from '../theme';

export default function ErrorPage() {
  const error = useRouteError();

  const message =
    error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      <Link to="/" style={{ marginTop: spacing.md }}>
        <Text style={styles.linkText}>Go to Home</Text>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
    color: '#333',
  },
  message: {
    fontSize: fontSize.base,
    color: '#666',
    textAlign: 'center',
  },
  linkText: {
    fontSize: fontSize.base,
    color: '#4285f4',
  },
});
