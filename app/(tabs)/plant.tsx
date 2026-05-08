import { AppHeader, Button, Card, GrowthStrip, Icon, IconButton } from '@/components/ui'
import { PlantHeroScene } from '@/components/plant/PlantHeroScene'
import { layout, spacing, typography } from '@/constants/Tokens'
import { MAX_HEALTH, PLANT_SKINS, STAGE_ORDER, XP_PER_STAGE } from '@/gameplay'
import { useTheme } from '@/hooks/useTheme'
import { getPlantDashboardData } from '@/services/plant'
import type {
  PlantDiagnosis,
  PlantRecommendation,
  PlantTimelineItem,
} from '@/services/plantStatusService'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View, type DimensionValue } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function ProgressBar({
  value,
  max,
  color,
  trackColor,
}: {
  value: number
  max: number
  color: string
  trackColor: string
}) {
  const widthPct = `${Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))}%` as DimensionValue
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <View style={[styles.progressFill, { backgroundColor: color, width: widthPct }]} />
    </View>
  )
}

function ConditionCard({
  icon,
  label,
  value,
  helper,
  theme,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  value: string
  helper?: string
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <Card style={styles.conditionCard} tone="muted">
      <View style={[styles.conditionIcon, { backgroundColor: theme.surface }]}>
        <Icon color={theme.primary} name={icon} size={16} />
      </View>
      <Text style={[typography.caption, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[typography.h3, { color: theme.text }]}>{value}</Text>
      {helper ? (
        <Text style={[typography.caption, { color: theme.textSecondary }]}>{helper}</Text>
      ) : null}
    </Card>
  )
}

function SummaryPill({
  label,
  value,
  helper,
  theme,
}: {
  label: string
  value: string
  helper?: string
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <View style={[styles.summaryPill, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
      <Text style={[typography.caption, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[typography.body, { color: theme.text }]}>{value}</Text>
      {helper ? (
        <Text style={[typography.caption, { color: theme.textSecondary }]}>{helper}</Text>
      ) : null}
    </View>
  )
}

function DriverCard({
  emoji,
  title,
  body,
  theme,
}: {
  emoji: string
  title: string
  body: string
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <Card style={styles.driverCard} tone="muted">
      <Text style={styles.driverEmoji}>{emoji}</Text>
      <Text style={[typography.bodySmall, { color: theme.text }]}>{title}</Text>
      <Text style={[typography.caption, { color: theme.textSecondary }]}>{body}</Text>
    </Card>
  )
}

function ForecastRow({
  icon,
  label,
  value,
  helper,
  theme,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  value: string
  helper?: string
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <View style={styles.forecastRow}>
      <View style={[styles.forecastIcon, { backgroundColor: theme.surfaceMuted }]}>
        <Icon color={theme.primary} name={icon} size={16} />
      </View>
      <View style={styles.flexText}>
        <Text style={[typography.bodySmall, { color: theme.text }]}>{label}</Text>
        {helper ? (
          <Text style={[typography.caption, { color: theme.textSecondary }]}>{helper}</Text>
        ) : null}
      </View>
      <Text style={[typography.caption, { color: theme.textSecondary }]}>{value}</Text>
    </View>
  )
}

function DiagnosisRow({
  diagnosis,
  theme,
  t,
}: {
  diagnosis: PlantDiagnosis
  theme: ReturnType<typeof useTheme>
  t: ReturnType<typeof useTranslation>['t']
}) {
  return (
    <View style={styles.diagnosisRow}>
      <View style={[styles.diagnosisDot, { backgroundColor: theme.primaryLight }]} />
      <Text style={[typography.bodySmall, styles.flexText, { color: theme.text }]}>
        {String(t(`plant.diagnoses.${diagnosis.kind}`, diagnosis.params as any))}
      </Text>
    </View>
  )
}

function TimelineRow({
  item,
  theme,
  t,
}: {
  item: PlantTimelineItem
  theme: ReturnType<typeof useTheme>
  t: ReturnType<typeof useTranslation>['t']
}) {
  const iconName =
    item.kind === 'session'
      ? 'play-circle'
      : item.kind === 'skin'
        ? 'award'
        : item.kind === 'streak'
          ? 'zap'
          : item.kind === 'stage'
            ? 'activity'
            : 'feather'

  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineIcon, { backgroundColor: theme.surfaceMuted }]}>
        <Icon color={theme.primary} name={iconName} size={16} />
      </View>
      <View style={styles.flexText}>
        <Text style={[typography.bodySmall, { color: theme.text }]}>
          {getTimelineTitle(item, t)}
        </Text>
        <Text style={[typography.caption, { color: theme.textSecondary }]}>
          {getTimelineBody(item, t)}
        </Text>
      </View>
      <Text style={[typography.caption, { color: theme.textSecondary }]}>
        {formatDate(item.date)}
      </Text>
    </View>
  )
}

function GrowthStageCard({
  activeSkinId,
  currentStage,
  health,
  speciesId,
  stage,
  theme,
}: {
  activeSkinId: string
  currentStage: string
  health: number
  speciesId: string
  stage: string
  theme: ReturnType<typeof useTheme>
}) {
  const { t } = useTranslation()
  const stageIndex = STAGE_ORDER.indexOf(stage as typeof STAGE_ORDER[number])
  const currentIndex = STAGE_ORDER.indexOf(currentStage as typeof STAGE_ORDER[number])
  const isCurrent = stage === currentStage
  const isReached = stageIndex <= currentIndex
  const statusIcon = isCurrent ? 'activity' : isReached ? 'check-circle' : 'clock'
  const sceneHealth = isCurrent ? health : isReached ? 92 : 100
  const signals = getStageVisualSignals(stage as typeof STAGE_ORDER[number])

  return (
    <View
      style={[
        styles.growthStageCard,
        {
          backgroundColor: isCurrent ? theme.primaryLight : theme.surfaceAlt,
          borderColor: isCurrent ? theme.primary : theme.border,
          opacity: isReached ? 1 : 0.72,
        },
      ]}
    >
      <View style={styles.growthStageHeader}>
        <Text style={[typography.bodySmall, { color: theme.text }]}>{t(`stages.${stage}` as any)}</Text>
        <Icon color={isCurrent ? theme.primary : theme.textSecondary} name={statusIcon} size={14} />
      </View>
      <PlantHeroScene
        health={sceneHealth}
        height={156}
        skinId={activeSkinId}
        speciesId={speciesId}
        stage={stage}
        totalFertilizer={stageIndex * 28}
        totalRoots={stageIndex * 26}
        totalSun={stageIndex * 24}
        totalWater={stageIndex * 26}
      />
      <View style={styles.growthStageSignals}>
        <StageSignalDots
          activeColor="#7f5b3e"
          isCurrent={isCurrent}
          kind="root"
          level={signals.root}
          theme={theme}
        />
        <StageSignalDots
          activeColor="#725137"
          isCurrent={isCurrent}
          kind="trunk"
          level={signals.trunk}
          theme={theme}
        />
        <StageSignalDots
          activeColor="#5f9251"
          isCurrent={isCurrent}
          kind="canopy"
          level={signals.canopy}
          theme={theme}
        />
        <StageSignalDots
          activeColor="#cb5a4b"
          isCurrent={isCurrent}
          kind="fruit"
          level={signals.fruit}
          theme={theme}
        />
      </View>
      <View style={styles.growthStageFooter}>
        <Text style={[typography.caption, { color: theme.textSecondary }]}>
          {XP_PER_STAGE[stage]} XP
        </Text>
        {isCurrent ? (
          <Text style={[typography.caption, { color: theme.primary }]}>{health}/{MAX_HEALTH}</Text>
        ) : null}
      </View>
    </View>
  )
}

function getStageVisualSignals(stage: typeof STAGE_ORDER[number]) {
  if (stage === 'seed') {
    return { root: 1, trunk: 0, canopy: 0, fruit: 0 }
  }

  if (stage === 'sprout') {
    return { root: 2, trunk: 1, canopy: 1, fruit: 0 }
  }

  if (stage === 'sapling') {
    return { root: 3, trunk: 2, canopy: 2, fruit: 0 }
  }

  if (stage === 'mature') {
    return { root: 4, trunk: 3, canopy: 4, fruit: 1 }
  }

  return { root: 4, trunk: 4, canopy: 4, fruit: 4 }
}

function StageSignalDots({
  activeColor,
  isCurrent,
  kind,
  level,
  theme,
}: {
  activeColor: string
  isCurrent: boolean
  kind: 'root' | 'trunk' | 'canopy' | 'fruit'
  level: number
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <View style={styles.stageSignalMeter}>
      {Array.from({ length: 4 }).map((_, index) => {
        const active = index < level
        return (
          <View
            key={`${kind}-${index}`}
            style={[
              styles.stageSignalDot,
              kind === 'root' ? styles.stageSignalRoot : null,
              kind === 'trunk' ? styles.stageSignalTrunk : null,
              kind === 'canopy' ? styles.stageSignalCanopy : null,
              kind === 'fruit' ? styles.stageSignalFruit : null,
              kind === 'root'
                ? { transform: [{ rotate: `${index % 2 === 0 ? -16 : 14}deg` }] }
                : null,
              {
                backgroundColor: active
                  ? activeColor
                  : theme.surface,
                borderColor: active
                  ? activeColor
                  : theme.border,
                opacity: active ? (isCurrent ? 1 : 0.9) : 0.75,
              },
            ]}
          />
        )
      })}
    </View>
  )
}

function getTimelineTitle(item: PlantTimelineItem, t: ReturnType<typeof useTranslation>['t']): string {
  if (item.kind === 'stage') return t('plant.timeline.stageTitle')
  if (item.kind === 'skin') return t('plant.timeline.skinTitle')
  if (item.kind === 'streak') return t('plant.timeline.streakTitle')
  if (item.kind === 'start') return t('plant.timeline.startTitle')
  return t('plant.timeline.sessionTitle')
}

function getTimelineBody(item: PlantTimelineItem, t: ReturnType<typeof useTranslation>['t']): string {
  if (item.kind === 'stage') {
    return t('plant.timeline.stageBody', { stage: t(`stages.${item.stage}` as any) })
  }
  if (item.kind === 'skin') {
    const skinName = PLANT_SKINS.find((skin) => skin.id === item.skinId)?.name ?? item.skinId
    return t('plant.timeline.skinBody', { skin: skinName })
  }
  if (item.kind === 'streak') {
    return t('plant.timeline.streakBody', { count: item.streak })
  }
  if (item.kind === 'start') {
    return t('plant.timeline.startBody')
  }
  return t('plant.timeline.sessionBody', {
    skill: t(`plant.skills.${item.skillType}` as any),
    xp: item.xpEarned,
  })
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString()
}

function getRiskColor(risk: 'high' | 'watch' | 'low', theme: ReturnType<typeof useTheme>): string {
  if (risk === 'high') return theme.danger
  if (risk === 'watch') return theme.accent
  return theme.success
}

export default function PlantScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof getPlantDashboardData>> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getPlantDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => {
    void load()
  }, [load]))

  if (loading || !dashboard) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[typography.body, { color: theme.textSecondary }]}>{t('plant.loading')}</Text>
      </SafeAreaView>
    )
  }

  const stageLabel = t(`stages.${dashboard.plant.stage}` as any)
  const nextStageLabel = dashboard.growth.nextStage
    ? t(`stages.${dashboard.growth.nextStage}` as any)
    : t('plant.fullyGrown')
  const moodLabel = t(`plant.moods.${dashboard.insights.mood}` as any)
  const riskColor = getRiskColor(dashboard.insights.risk, theme)
  const recommendation = dashboard.insights.recommendation
  const healthVisualHint = dashboard.plant.displayHealth < 80
    ? t('plant.visualState.unhealthy')
    : dashboard.plant.displayHealth < 92
      ? t('plant.visualState.watch')
      : t('plant.visualState.healthy')

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader
          action={
            <IconButton
              icon="settings"
              label={t('home.openSettings')}
              onPress={() => router.push('/settings' as any)}
            />
          }
          eyebrow={t('tabs.plant')}
          subtitle={t('plant.subtitle')}
          title={t('plant.title')}
        />

        <Card elevated style={styles.heroCard} tone="accent">
          <View style={styles.heroTop}>
            <PlantHeroScene
              health={dashboard.plant.displayHealth}
              height={250}
              skinId={dashboard.activeSkinId}
              speciesId={dashboard.plant.speciesId}
              stage={dashboard.plant.stage}
              style={styles.heroScene}
              totalFertilizer={dashboard.plant.totalFertilizer}
              totalRoots={dashboard.plant.totalRoots}
              totalSun={dashboard.plant.totalSun}
              totalWater={dashboard.plant.totalWater}
              width="100%"
            />
            <View style={styles.heroCopy}>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{stageLabel}</Text>
              <Text style={[typography.h2, { color: theme.text }]}>{moodLabel}</Text>
              <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>
                {t('plant.skinLine', { skin: dashboard.activeSkinName })}
              </Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {healthVisualHint}
              </Text>
            </View>
          </View>

          <View style={styles.healthHeader}>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('plant.healthMeter')}</Text>
            <Text style={[typography.caption, { color: theme.text }]}>{dashboard.plant.displayHealth}/{MAX_HEALTH}</Text>
          </View>
          <ProgressBar
            color={dashboard.plant.displayHealth >= 60 ? theme.success : dashboard.plant.displayHealth >= 30 ? theme.accent : theme.danger}
            max={MAX_HEALTH}
            trackColor={theme.surface}
            value={dashboard.plant.displayHealth}
          />

          <View style={styles.healthHeader}>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('plant.growthOverview')}</Text>
            <Text style={[typography.caption, { color: theme.text }]}>{Math.round(dashboard.growth.progressPercent)}%</Text>
          </View>
          <ProgressBar
            color={theme.primary}
            max={100}
            trackColor={theme.surface}
            value={dashboard.growth.progressPercent}
          />
          <Text style={[typography.caption, { color: theme.textSecondary }]}>
            {dashboard.growth.isMaxStage
              ? t('plant.fullyGrown')
              : t('plant.xpToNextStage', {
                xp: dashboard.growth.xpToNextStage,
                stage: nextStageLabel,
              })}
          </Text>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('plant.growthOverview')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t('plant.growthOverviewHint')}
              </Text>
            </View>
          </View>

          <View style={styles.stageRow}>
            <View style={[styles.stageChip, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}>
              <Text style={[typography.caption, { color: theme.primary }]}>{stageLabel}</Text>
            </View>
            <Icon color={theme.textSecondary} name="arrow-right" size={16} />
            <View style={[styles.stageChip, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{nextStageLabel}</Text>
            </View>
          </View>

          <Text style={[typography.caption, { color: theme.textSecondary }]}>
            {t('plant.growthProcessHint')}
          </Text>

          <ScrollView
            contentContainerStyle={styles.growthProcessRow}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
          >
            {STAGE_ORDER.map((stage) => (
              <GrowthStageCard
                activeSkinId={dashboard.activeSkinId}
                currentStage={dashboard.plant.stage}
                health={dashboard.plant.displayHealth}
                key={stage}
                speciesId={dashboard.plant.speciesId}
                stage={stage}
                theme={theme}
              />
            ))}
          </ScrollView>

          <View style={styles.summaryPillGrid}>
            <SummaryPill
              helper={t('plant.currentStage')}
              label={t('plant.metrics.level')}
              theme={theme}
              value={`Lv ${dashboard.plant.level}`}
            />
            <SummaryPill
              helper={t('plant.paceHint')}
              label={t('plant.forecastSessionXp')}
              theme={theme}
              value={t('plant.forecastSessionXpValue', { xp: dashboard.forecast.estimatedSessionXp })}
            />
            <SummaryPill
              helper={dashboard.growth.isMaxStage ? t('plant.fullyGrown') : t('plant.xpToNextStage', { xp: dashboard.growth.xpToNextStage, stage: nextStageLabel })}
              label={t('plant.nextStage')}
              theme={theme}
              value={
                dashboard.growth.isMaxStage
                  ? t('plant.fullyGrown')
                  : t('plant.forecastSessionsToStage', {
                    count: dashboard.forecast.sessionsToNextStage,
                    stage: nextStageLabel,
                  })
              }
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('plant.last7Days')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t('plant.last7DaysHint')}
              </Text>
            </View>
          </View>
          <GrowthStrip items={dashboard.last7Days} />
          <View style={styles.summaryPillGrid}>
            <SummaryPill
              label={t('plant.sessionsLast7')}
              theme={theme}
              value={String(dashboard.last7DaysSummary.sessionCount)}
            />
            <SummaryPill
              label={t('plant.xpLast7')}
              theme={theme}
              value={`+${dashboard.last7DaysSummary.xpEarned}`}
            />
            <SummaryPill
              label={t('plant.activeDays')}
              theme={theme}
              value={String(dashboard.last7DaysSummary.activeDays)}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h3, { color: theme.text }]}>{t('plant.currentCondition')}</Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('plant.currentConditionHint')}</Text>
          </View>
          <View style={styles.conditionGrid}>
            <ConditionCard
              helper={t('plant.outOfHundred')}
              icon="heart"
              label={t('plant.metrics.health')}
              theme={theme}
              value={`${dashboard.plant.displayHealth}`}
            />
            <ConditionCard
              helper={t('plant.dayUnit')}
              icon="zap"
              label={t('plant.metrics.streak')}
              theme={theme}
              value={`${dashboard.streak}`}
            />
            <ConditionCard
              helper={stageLabel}
              icon="trending-up"
              label={t('plant.metrics.level')}
              theme={theme}
              value={`Lv ${dashboard.plant.level}`}
            />
            <ConditionCard
              helper={t(`plant.risks.${dashboard.insights.risk}` as any)}
              icon="shield"
              label={t('plant.metrics.risk')}
              theme={theme}
              value={t(`plant.riskShort.${dashboard.insights.risk}` as any)}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('plant.growthDrivers')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t('plant.growthDriversHint')}
              </Text>
            </View>
          </View>
          <View style={styles.driverGrid}>
            <DriverCard
              body={t('plant.growthDriverWaterBody')}
              emoji="💧"
              theme={theme}
              title={t('plant.growthDriverWaterTitle')}
            />
            <DriverCard
              body={t('plant.growthDriverSunBody')}
              emoji="☀️"
              theme={theme}
              title={t('plant.growthDriverSunTitle')}
            />
            <DriverCard
              body={t('plant.growthDriverFertilizerBody')}
              emoji="🪴"
              theme={theme}
              title={t('plant.growthDriverFertilizerTitle')}
            />
            <DriverCard
              body={t('plant.growthDriverRootsBody')}
              emoji="🌱"
              theme={theme}
              title={t('plant.growthDriverRootsTitle')}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard} tone="muted">
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('plant.forecastTitle')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t('plant.forecastHint')}
              </Text>
            </View>
          </View>
          <View style={styles.forecastList}>
            <ForecastRow
              helper={t('plant.paceHint')}
              icon="zap"
              label={t('plant.forecastSessionXp')}
              theme={theme}
              value={t('plant.forecastSessionXpValue', { xp: dashboard.forecast.estimatedSessionXp })}
            />
            <ForecastRow
              helper={
                dashboard.growth.isMaxStage
                  ? t('plant.fullyGrown')
                  : t('plant.xpToNextStage', {
                    xp: dashboard.growth.xpToNextStage,
                    stage: nextStageLabel,
                  })
              }
              icon="trending-up"
              label={t('plant.nextStage')}
              theme={theme}
              value={
                dashboard.growth.isMaxStage
                  ? t('plant.fullyGrown')
                  : t('plant.forecastSessionsToStage', {
                    count: dashboard.forecast.sessionsToNextStage,
                    stage: nextStageLabel,
                  })
              }
            />
            <ForecastRow
              helper={t('plant.skipRiskHint')}
              icon="shield"
              label={t('plant.skipRisk')}
              theme={theme}
              value={t('plant.forecastSkipHealth', { health: dashboard.forecast.healthIfSkipTwoDays })}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h3, { color: theme.text }]}>{t('plant.whyTitle')}</Text>
            <View style={[styles.riskBadge, { backgroundColor: `${riskColor}18` }]}>
              <Text style={[typography.caption, { color: riskColor }]}>
                {t(`plant.risks.${dashboard.insights.risk}` as any)}
              </Text>
            </View>
          </View>
          <View style={styles.diagnosisList}>
            {dashboard.insights.diagnoses.map((diagnosis, index) => (
              <DiagnosisRow diagnosis={diagnosis} key={`${diagnosis.kind}-${index}`} theme={theme} t={t} />
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard} tone="muted">
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('plant.needsToday')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t(`plant.recommendations.${recommendation.kind}.body` as any)}
              </Text>
            </View>
          </View>
          <Button
            icon={recommendation.kind === 'recovery' ? 'refresh-cw' : 'play-circle'}
            onPress={() => router.push(recommendation.href as any)}
            size="lg"
            title={t(`plant.recommendations.${recommendation.kind}.cta` as any)}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('plant.timelineTitle')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t('plant.timelineHint')}
              </Text>
            </View>
          </View>
          <View style={styles.timelineList}>
            {dashboard.insights.timeline.map((item) => (
              <TimelineRow item={item} key={item.id} theme={theme} t={t} />
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: layout.sectionGap,
    paddingBottom: spacing.xxl,
    paddingHorizontal: layout.screenGutter,
  },
  heroCard: {
    gap: spacing.md,
  },
  heroTop: {
    gap: spacing.md,
  },
  heroScene: {
    alignSelf: 'center',
    maxWidth: 320,
  },
  heroCopy: {
    gap: spacing.xs,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  conditionCard: {
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.xs,
  },
  conditionIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  riskBadge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stageChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  growthProcessRow: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  growthStageCard: {
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm,
    width: 184,
  },
  growthStageSignals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: 2,
  },
  stageSignalMeter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    minHeight: 18,
  },
  stageSignalDot: {
    borderWidth: 1,
  },
  stageSignalRoot: {
    borderRadius: 999,
    height: 12,
    width: 3,
  },
  stageSignalTrunk: {
    borderRadius: 3,
    height: 12,
    width: 5,
  },
  stageSignalCanopy: {
    borderRadius: 999,
    height: 9,
    width: 9,
  },
  stageSignalFruit: {
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  growthStageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  growthStageFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryPillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryPill: {
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '31%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.sm + 2,
  },
  diagnosisList: {
    gap: spacing.sm,
  },
  diagnosisRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  diagnosisDot: {
    borderRadius: 999,
    height: 10,
    marginTop: 6,
    width: 10,
  },
  flexText: {
    flex: 1,
  },
  timelineList: {
    gap: spacing.md,
  },
  driverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  driverCard: {
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.xs,
  },
  driverEmoji: {
    fontSize: 24,
  },
  forecastList: {
    gap: spacing.md,
  },
  forecastRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  forecastIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  timelineRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timelineIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
})
