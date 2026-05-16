import { createContext, useContext, type ReactNode } from 'react'
import { type ThemeColors } from '@/constants/Colors'

export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeContextValue {
  colors: ThemeColors
  mode: ThemeMode
  setMode: (next: ThemeMode) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children, value }: { children: ReactNode; value: ThemeContextValue }) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeColors {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx.colors
}

export function useThemeMode(): { mode: ThemeMode; setMode: (next: ThemeMode) => Promise<void> } {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeMode must be used within a ThemeProvider')
  }
  return { mode: ctx.mode, setMode: ctx.setMode }
}
