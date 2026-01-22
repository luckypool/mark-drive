import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { colors, shadows } from '../../theme';

interface FABProps {
  onPress: () => void;
  icon: React.ReactNode;
  isOpen?: boolean;
  style?: ViewStyle;
}

export function FAB({ onPress, icon, isOpen = false, style }: FABProps) {
  const rotation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotation, {
      toValue: isOpen ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotation]);

  const rotateStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.fab, shadows.lg, style]}
      activeOpacity={0.8}
    >
      <Animated.View style={rotateStyle}>{icon}</Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 900,
  },
});
