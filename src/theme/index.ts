/**
 * Theme exports
 */

export { colors, withOpacity } from './colors';
export type { ColorKey } from './colors';

export { lightColors } from './lightColors';
export type { LightColorKey } from './lightColors';

export {
  spacing,
  borderRadius,
  fontSize,
  lineHeight,
  fontWeight,
} from './spacing';
export type {
  SpacingKey,
  BorderRadiusKey,
  FontSizeKey,
  FontWeightKey,
} from './spacing';

// Common shadow styles (web-only, empty objects for compatibility with app/)
// Note: ViewStyle is import type only (erased at runtime), kept for app/ compatibility
import type { ViewStyle } from 'react-native';

export const shadows: Record<string, ViewStyle> = {
  sm: {},
  md: {},
  lg: {},
  xl: {},
  glow: {},
};
