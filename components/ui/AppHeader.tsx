import { spacing, typography } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface AppHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export function AppHeader({ eyebrow, title, subtitle, action }: AppHeaderProps) {
  const theme = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        {eyebrow ? (
          <Text style={[typography.caption, styles.eyebrow, { color: theme.textSecondary }]}>
            {eyebrow}
          </Text>
        ) : null}
        <Text style={[typography.h2, { color: theme.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.bodySmall, styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    letterSpacing: 1,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  action: {
    marginTop: spacing.xxs,
  },
})
