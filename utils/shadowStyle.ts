import { Platform } from 'react-native';

/**
 * Cross-platform drop-shadow helper.
 *
 *   const styles = StyleSheet.create({
 *     card: {
 *       ...shadow(2), // small elevation
 *     }
 *   })
 */
export function shadow(level: number = 2) {
  // iOS / Android keep native shadow props
  if (Platform.OS !== 'web') {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: level },
      shadowOpacity: 0.05,
      shadowRadius: level * 4,
      elevation: level,
    } as const;
  }

  // Web: translate to CSS box-shadow
  const blur = level * 4;
  return {
    boxShadow: `0 ${level}px ${blur}px rgba(0,0,0,0.05)`,
  } as const;
}

/**
 * Cross-platform text-shadow helper.
 *
 *   title: {
 *     ...textShadow('#FF5722', 1)
 *   }
 */
export function textShadow(color: string, level: number = 1) {
  if (Platform.OS !== 'web') {
    return {
      textShadowColor: color,
      textShadowOffset: { width: 0, height: level },
      textShadowRadius: level * 4,
    } as const;
  }
  // Web uses standard text-shadow css string
  const blur = level * 4;
  return {
    textShadow: `0 ${level}px ${blur}px ${color}`,
  } as const;
} 