/**
 * Theme exports
 */

export { colors, withOpacity } from './colors';
export type { ColorKey } from './colors';

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

// Common shadow styles (platform-aware)
import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

export const shadows: Record<string, ViewStyle> = Platform.select({
  ios: {
    sm: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    md: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
    },
    lg: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
    },
    glow: {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
    },
  },
  android: {
    sm: { elevation: 2 },
    md: { elevation: 6 },
    lg: { elevation: 12 },
    glow: { elevation: 8 },
  },
  default: {
    sm: {},
    md: {},
    lg: {},
    glow: {},
  },
}) as Record<string, ViewStyle>;
