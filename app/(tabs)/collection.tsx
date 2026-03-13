import { AppHeader, Card, IconButton } from '@/components/ui'
import { layout, radius, spacing, typography } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import { useWords } from '@/hooks/useWords'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function LevelBadge({ interval, color }: { interval: number; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[typography.caption, { color }]}>Int.{interval}</Text>
    </View>
  )
}

export default function CollectionScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { words, loading, refresh } = useWords()
  const { t } = useTranslation()

  useFocusEffect(useCallback(() => {
    void refresh()
  }, [refresh]))

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <Text style={[typography.body, { color: theme.textSecondary }]}>{t('collection.loading')}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={words}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <AppHeader
            action={
              <IconButton
                icon="settings"
                label={t('home.openSettings')}
                onPress={() => router.push('/settings' as any)}
              />
            }
            eyebrow={t('tabs.collection')}
            subtitle={t('collection.wordCount', { count: words.length })}
            title={t('collection.title')}
          />
        )}
        renderItem={({ item }) => (
          <Card style={styles.wordCard} tone="muted">
            <View style={styles.wordRow}>
              <View style={styles.wordCopy}>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: layout.screenGutter,
    paddingTop: spacing.sm,
  },
  wordCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  wordCard: {
    marginBottom: spacing.sm,
  },
  wordRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
