/**
 * Flatten RN-style arrays (e.g. [styles.foo, { color: 'red' }]) into a plain object.
 * Replacement for StyleSheet.flatten() without react-native dependency.
 */
export function flattenStyle(style: unknown): React.CSSProperties | undefined {
  if (!style) return undefined;
  if (Array.isArray(style)) return Object.assign({}, ...style.filter(Boolean).map(flattenStyle));
  return style as React.CSSProperties;
}
