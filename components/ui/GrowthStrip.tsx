import { spacing, typography } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import type { DailyGrowthActivity } from '@/utils/growth'
import { StyleSheet, Text, View } from 'react-native'

interface GrowthStripProps {
  items: ReadonlyArray<DailyGrowthActivity>
  compact?: boolean
}

function formatDayLabel(dateKey: string, compact: boolean): string {
  const formatted = new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: compact ? 'narrow' : 'short',
  })
  return compact ? formatted.slice(0, 1) : formatted
}

export function GrowthStrip({ items, compact = false }: GrowthStripProps) {
  const theme = useTheme()

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {items.map((item) => {
        const color =
          item.kind === 'none'
            ? theme.border
            : item.kind === 'strong'
              ? theme.success
              : theme.primary
        const height = compact ? (item.kind === 'strong' ? 24 : item.kind === 'steady' ? 16 : 8) : item.kind === 'strong' ? 32 : item.kind === 'steady' ? 22 : 10

        return (
          <View key={item.dateKey} style={styles.day}>
            <View
              style={[
                styles.bar,
                compact ? styles.barCompact : styles.barRegular,
                {
                  backgroundColor: color,
                  borderColor: item.isToday ? theme.primary : 'transparent',
                  height,
                },
              ]}
            />
            <Text
              style={[
                typography.caption,
                styles.label,
                {
                  color: item.isToday ? theme.primary : theme.textSecondary,
                },
              ]}>
              {formatDayLabel(item.dateKey, compact)}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  rowCompact: {
    gap: spacing.xxs,
  },
  day: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  bar: {
    borderRadius: 999,
    borderWidth: 1,
    width: '100%',
  },
  barCompact: {
    minHeight: 8,
  },
  barRegular: {
    minHeight: 10,
  },
  label: {
    textAlign: 'center',
  },
})
