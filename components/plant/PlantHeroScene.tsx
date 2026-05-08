import { radius } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import { useEffect } from 'react'
import { Image, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const VIEWBOX_WIDTH = 236
const VIEWBOX_HEIGHT = 220

const PLANT_STAGE_ORDER = ['seed', 'sprout', 'sapling', 'mature', 'bloom'] as const
type PlantStage = (typeof PLANT_STAGE_ORDER)[number]

type SceneAccent = {
  skyTop: string
  skyBottom: string
  haze: string
  groundShadow: string
}

const SCENE_ACCENTS: Record<string, SceneAccent> = {
  classic: {
    skyTop: '#eef5ea',
    skyBottom: '#d7e7d2',
    haze: 'rgba(255, 250, 239, 0.92)',
    groundShadow: 'rgba(62, 52, 43, 0.14)',
  },
  desert: {
    skyTop: '#f8efe4',
    skyBottom: '#ead8c3',
    haze: 'rgba(255, 246, 235, 0.9)',
    groundShadow: 'rgba(92, 70, 49, 0.16)',
  },
  tropical: {
    skyTop: '#e7f5ef',
    skyBottom: '#c9e4d7',
    haze: 'rgba(244, 251, 246, 0.88)',
    groundShadow: 'rgba(48, 64, 52, 0.14)',
  },
  garden: {
    skyTop: '#f5f1e8',
    skyBottom: '#e8dccf',
    haze: 'rgba(254, 249, 241, 0.9)',
    groundShadow: 'rgba(77, 61, 49, 0.15)',
  },
  forest: {
    skyTop: '#e6f0e6',
    skyBottom: '#cad9ca',
    haze: 'rgba(245, 249, 244, 0.86)',
    groundShadow: 'rgba(54, 67, 56, 0.16)',
  },
  aquatic: {
    skyTop: '#e8f5f8',
    skyBottom: '#cfe5eb',
    haze: 'rgba(247, 252, 253, 0.9)',
    groundShadow: 'rgba(62, 71, 75, 0.15)',
  },
  night: {
    skyTop: '#213343',
    skyBottom: '#17222e',
    haze: 'rgba(76, 95, 114, 0.44)',
    groundShadow: 'rgba(9, 14, 19, 0.26)',
  },
  fruit: {
    skyTop: '#f8f3e8',
    skyBottom: '#ecdfc8',
    haze: 'rgba(255, 250, 241, 0.92)',
    groundShadow: 'rgba(71, 54, 39, 0.16)',
  },
}

const APPLE_TREE_ASSETS = {
  healthy: {
    seed: require('../../assets/plants/apple-tree/healthy/seed.png'),
    sprout: require('../../assets/plants/apple-tree/healthy/sprout.png'),
    sapling: require('../../assets/plants/apple-tree/healthy/sapling.png'),
    mature: require('../../assets/plants/apple-tree/healthy/mature.png'),
    bloom: require('../../assets/plants/apple-tree/healthy/bloom.png'),
  },
  unhealthy: {
    seed: require('../../assets/plants/apple-tree/unhealthy/seed.png'),
    sprout: require('../../assets/plants/apple-tree/unhealthy/sprout.png'),
    sapling: require('../../assets/plants/apple-tree/unhealthy/sapling.png'),
    mature: require('../../assets/plants/apple-tree/unhealthy/mature.png'),
    bloom: require('../../assets/plants/apple-tree/unhealthy/bloom.png'),
  },
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clamp01(value: number): number {
  return clamp(value, 0, 1)
}

function isPlantStage(value: string): value is PlantStage {
  return PLANT_STAGE_ORDER.includes(value as PlantStage)
}

function getStageMetrics(stage: PlantStage) {
  if (stage === 'seed') {
    return { plantScale: 0.62, shadowWidth: '36%', shadowHeight: 16, lift: 10 }
  }

  if (stage === 'sprout') {
    return { plantScale: 0.66, shadowWidth: '40%', shadowHeight: 18, lift: 8 }
  }

  if (stage === 'sapling') {
    return { plantScale: 0.82, shadowWidth: '48%', shadowHeight: 22, lift: 2 }
  }

  if (stage === 'mature') {
    return { plantScale: 0.94, shadowWidth: '58%', shadowHeight: 24, lift: -2 }
  }

  return { plantScale: 0.96, shadowWidth: '60%', shadowHeight: 25, lift: -2 }
}

function getTreeBundle(speciesId: string) {
  if (
    speciesId === 'starter-fern' ||
    speciesId.includes('fruit') ||
    speciesId.includes('apple')
  ) {
    return APPLE_TREE_ASSETS
  }

  return APPLE_TREE_ASSETS
}

export interface PlantHeroSceneProps {
  speciesId: string
  stage: string
  health: number
  totalWater?: number
  totalSun?: number
  totalFertilizer?: number
  totalRoots?: number
  skinId?: string
  height?: number
  width?: DimensionValue
  style?: StyleProp<ViewStyle>
}

export function PlantHeroScene({
  speciesId,
  stage,
  health,
  totalWater = 0,
  totalSun = 0,
  totalFertilizer = 0,
  totalRoots = 0,
  skinId = 'fruit',
  height = 180,
  width,
  style,
}: PlantHeroSceneProps) {
  const theme = useTheme()
  const sway = useSharedValue(0)

  useEffect(() => {
    sway.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 3200 }),
        withTiming(0.4, { duration: 2400 }),
        withTiming(1, { duration: 3400 }),
        withTiming(-0.3, { duration: 2600 }),
      ),
      -1,
      false,
    )
  }, [sway])

  const stageKey = isPlantStage(stage) ? stage : 'seed'
  const healthPct = clamp01(health / 100)
  const waterPct = clamp01(totalWater / 140)
  const sunPct = clamp01(totalSun / 140)
  const fertilizerPct = clamp01(totalFertilizer / 140)
  const rootsPct = clamp01(totalRoots / 140)
  const stressOpacity = clamp01((92 - health) / 54)
  const droop = clamp01((85 - health) / 55)
  const accent = SCENE_ACCENTS[skinId] ?? SCENE_ACCENTS.fruit
  const stageMetrics = getStageMetrics(stageKey)
  const treeAssets = getTreeBundle(speciesId)
  const groundOpacity = 0.14 + rootsPct * 0.06 + sunPct * 0.03
  const hazeOpacity = 0.84 - stressOpacity * 0.18
  const dustOpacity = stressOpacity * (0.18 + (1 - waterPct) * 0.2)
  const fruitRichness = stageKey === 'bloom' ? 0.12 + fertilizerPct * 0.12 : 0

  const plantMotionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: stageMetrics.lift + droop * 10 - rootsPct * 3 },
      { rotate: `${-droop * 2 + sway.value * (0.2 + healthPct * 0.3)}deg` },
      { scale: stageMetrics.plantScale + rootsPct * 0.02 },
    ],
  }))

  const frontLayerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sway.value * (1.8 + sunPct * 0.9) }],
  }))

  const backLayerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sway.value * 0.9 }],
  }))

  return (
    <View
      style={[
        styles.frame,
        {
          height,
          borderColor: stageKey === 'seed' || stageKey === 'sprout'
            ? `${theme.border}`
            : `${theme.border}`,
          backgroundColor: accent.skyBottom,
        },
        typeof width === 'undefined' ? styles.aspect : { width },
        style,
      ]}
    >
      <View style={[styles.skyLayer, { backgroundColor: accent.skyTop }]} />
      <View style={[styles.haze, { backgroundColor: accent.haze, opacity: hazeOpacity }]} />
      <View style={[styles.hazeSmall, { backgroundColor: accent.haze, opacity: 0.34 + sunPct * 0.12 }]} />
      <View
        style={[
          styles.shadow,
          {
            backgroundColor: accent.groundShadow,
            height: stageMetrics.shadowHeight,
            opacity: groundOpacity,
            width: stageMetrics.shadowWidth as DimensionValue,
          },
        ]}
      />

      <Animated.View pointerEvents="none" style={[styles.assetLayer, plantMotionStyle]}>
        <Animated.View style={[styles.assetPlane, backLayerStyle, { opacity: clamp01(1 - stressOpacity * 0.52) }]}>
          <Image
            source={treeAssets.healthy[stageKey]}
            style={styles.assetImage}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View style={[styles.assetPlane, frontLayerStyle, { opacity: stressOpacity }]}>
          <Image
            source={treeAssets.unhealthy[stageKey]}
            style={styles.assetImage}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>

      <View
        pointerEvents="none"
        style={[
          styles.dryVeil,
          {
            opacity: dustOpacity,
          },
        ]}
      />
      {fruitRichness > 0 ? (
        <View
          pointerEvents="none"
          style={[
            styles.fruitGlow,
            {
              opacity: clamp01(fruitRichness - stressOpacity * 0.06),
            },
          ]}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.lg + 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  aspect: {
    aspectRatio: VIEWBOX_WIDTH / VIEWBOX_HEIGHT,
  },
  skyLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  haze: {
    borderRadius: 999,
    height: '58%',
    left: '13%',
    position: 'absolute',
    top: '7%',
    width: '74%',
  },
  hazeSmall: {
    borderRadius: 999,
    bottom: '18%',
    height: '14%',
    position: 'absolute',
    right: '8%',
    width: '28%',
  },
  shadow: {
    alignSelf: 'center',
    borderRadius: 999,
    bottom: '12%',
    position: 'absolute',
  },
  assetLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetPlane: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetImage: {
    height: '92%',
    width: '92%',
  },
  dryVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(127, 108, 83, 0.16)',
  },
  fruitGlow: {
    backgroundColor: 'rgba(255, 232, 213, 0.14)',
    borderRadius: 999,
    height: '26%',
    left: '27%',
    position: 'absolute',
    top: '21%',
    width: '46%',
  },
})
