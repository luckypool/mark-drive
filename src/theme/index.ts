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

// Common shadow styles (web-only, empty objects for compatibility)
export const shadows: Record<string, React.CSSProperties> = {
  sm: {},
  md: {},
  lg: {},
  xl: {},
  glow: {},
};
