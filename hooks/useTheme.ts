import { useColorScheme } from 'react-native'
import { light, dark, type ThemeColors } from '@/constants/Colors'

export function useTheme(): ThemeColors {
  const scheme = useColorScheme()
  return scheme === 'dark' ? dark : light
}
