import { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  type ViewToken,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui'
import { spacing, typography } from '@/constants/Tokens'
import { setSetting } from '@/db'
import { useTranslation } from 'react-i18next'

const { width } = Dimensions.get('window')

interface Slide {
  key: string
  emoji: string
  titleKey: string
  descKey: string
}

const SLIDES: Slide[] = [
  { key: '1', emoji: '🌱', titleKey: 'onboarding.welcome', descKey: 'onboarding.welcomeDesc' },
  { key: '2', emoji: '📖', titleKey: 'onboarding.learnDaily', descKey: 'onboarding.learnDailyDesc' },
  { key: '3', emoji: '🌳', titleKey: 'onboarding.growPlant', descKey: 'onboarding.growPlantDesc' },
  { key: '4', emoji: '🚀', titleKey: 'onboarding.getStarted', descKey: 'onboarding.getStartedDesc' },
]

export default function OnboardingScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const isLast = activeIndex === SLIDES.length - 1

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index)
      }
    },
  ).current

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  async function handleNext() {
    if (isLast) {
      await setSetting('onboardingComplete', '1')
      router.replace('/(tabs)')
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true })
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={item => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[typography.h1, { color: theme.text, textAlign: 'center', marginTop: spacing.lg }]}>
              {t(item.titleKey)}
            </Text>
            <Text style={[typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.xl }]}>
              {t(item.descKey)}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === activeIndex ? theme.primary : theme.border },
              ]}
            />
          ))}
        </View>

        <Button
          title={isLast ? t('onboarding.start') : t('onboarding.next')}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emoji: {
    fontSize: 96,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  button: {
    width: '100%',
  },
})
