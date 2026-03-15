import { useColorScheme } from 'react-native'
import { Colors, type ThemeMode } from '@/constants/theme'

export function useTheme(): { colors: typeof Colors.dark; mode: ThemeMode } {
  const colorScheme = useColorScheme() ?? 'dark'
  return {
    colors: Colors[colorScheme],
    mode: colorScheme,
  }
}
