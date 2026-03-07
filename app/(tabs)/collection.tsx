import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { useWords } from '@/hooks/useWords'
import { Card } from '@/components/ui'
import { spacing, typography, radius } from '@/constants/Tokens'
import { useTranslation } from 'react-i18next'

function LevelBadge({ interval, color }: { interval: number; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[typography.caption, { color }]}>Int.{interval}</Text>
    </View>
  )
}

export default function CollectionScreen() {
  const theme = useTheme()
  const { words, loading } = useWords()
  const { t } = useTranslation()

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <Text style={[typography.body, { color: theme.textSecondary }]}>{t('collection.loading')}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[typography.h2, styles.title, { color: theme.text }]}>
        {t('collection.title')}
      </Text>
      <Text style={[typography.bodySmall, styles.subtitle, { color: theme.textSecondary }]}>
        {t('collection.wordCount', { count: words.length })}
      </Text>
      <FlatList
        data={words}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.wordCard}>
            <View style={styles.wordRow}>
              <View>
                <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>
                  {item.word}
                </Text>
                <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>
                  {item.meaning}
                </Text>
              </View>
              <View style={styles.meta}>
                <LevelBadge interval={item.interval} color={theme.primary} />
                <Text style={[typography.caption, { color: theme.textSecondary }]}>
                  {t('collection.lapses', { count: item.lapses })}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  wordCard: {
    marginBottom: spacing.sm,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
})
