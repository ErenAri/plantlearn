import { radius } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import { useEffect } from 'react'
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg'

const VIEWBOX_WIDTH = 236
const VIEWBOX_HEIGHT = 220

const PLANT_STAGE_ORDER = ['seed', 'sprout', 'sapling', 'mature', 'bloom'] as const
type PlantStage = (typeof PLANT_STAGE_ORDER)[number]

type SceneAccent = {
  skyTop: string
  skyBottom: string
  haze: string
  soil: string
}

type CanopySpec = {
  cx: number
  cy: number
  rx: number
  ry: number
  rotation: number
  tint: number
  layer: 'back' | 'front'
}

type FruitSpec = {
  cx: number
  cy: number
  r: number
  tilt: number
  kind: 'apple' | 'blossom' | 'bud'
}

type BranchSpec = {
  d: string
  width: number
  tint: number
}

const SCENE_ACCENTS: Record<string, SceneAccent> = {
  classic: {
    skyTop: '#eef5ea',
    skyBottom: '#dbe8d2',
    haze: '#f7f2e7',
    soil: '#614732',
  },
  desert: {
    skyTop: '#f7efe4',
    skyBottom: '#ebd9bf',
    haze: '#fbf4ea',
    soil: '#74513a',
  },
  tropical: {
    skyTop: '#e6f4ef',
    skyBottom: '#c6e1d4',
    haze: '#eff8f4',
    soil: '#564434',
  },
  garden: {
    skyTop: '#f4f0e7',
    skyBottom: '#e6d9c7',
    haze: '#fcf7ef',
    soil: '#654837',
  },
  forest: {
    skyTop: '#e5efe6',
    skyBottom: '#c7d7c7',
    haze: '#f2f7f1',
    soil: '#554537',
  },
  aquatic: {
    skyTop: '#e8f5f8',
    skyBottom: '#cbe1e7',
    haze: '#f4fafb',
    soil: '#57514a',
  },
  night: {
    skyTop: '#203142',
    skyBottom: '#17212d',
    haze: '#31475e',
    soil: '#433730',
  },
  fruit: {
    skyTop: '#f7f2e6',
    skyBottom: '#ebdbc0',
    haze: '#fdf8ef',
    soil: '#654933',
  },
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clamp01(value: number): number {
  return clamp(value, 0, 1)
}

function hexToRgb(value: string): { r: number; g: number; b: number } {
  const hex = value.replace('#', '')
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mixHex(from: string, to: string, amount: number): string {
  const t = clamp01(amount)
  const start = hexToRgb(from)
  const end = hexToRgb(to)
  return rgbToHex(
    start.r + (end.r - start.r) * t,
    start.g + (end.g - start.g) * t,
    start.b + (end.b - start.b) * t,
  )
}

function withAlpha(hex: string, opacity: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${clamp01(opacity)})`
}

function isPlantStage(value: string): value is PlantStage {
  return PLANT_STAGE_ORDER.includes(value as PlantStage)
}

function getTrunkTop(stage: PlantStage): number {
  if (stage === 'seed') return 142
  if (stage === 'sprout') return 128
  if (stage === 'sapling') return 110
  if (stage === 'mature') return 88
  return 82
}

function getTrunkWidth(stage: PlantStage): number {
  if (stage === 'seed') return 4
  if (stage === 'sprout') return 5
  if (stage === 'sapling') return 9
  if (stage === 'mature') return 13
  return 15
}

function getCanopy(stage: PlantStage): CanopySpec[] {
  if (stage === 'seed' || stage === 'sprout') {
    return []
  }

  if (stage === 'sapling') {
    return [
      { cx: 100, cy: 114, rx: 22, ry: 18, rotation: -16, tint: 0.2, layer: 'back' },
      { cx: 136, cy: 114, rx: 22, ry: 18, rotation: 16, tint: 0.16, layer: 'back' },
      { cx: 88, cy: 127, rx: 16, ry: 12, rotation: -24, tint: 0.26, layer: 'back' },
      { cx: 118, cy: 101, rx: 28, ry: 22, rotation: 0, tint: 0.06, layer: 'front' },
      { cx: 118, cy: 120, rx: 22, ry: 17, rotation: 0, tint: 0.12, layer: 'front' },
      { cx: 145, cy: 126, rx: 16, ry: 12, rotation: 22, tint: 0.18, layer: 'front' },
    ]
  }

  if (stage === 'mature') {
    return [
      { cx: 90, cy: 106, rx: 26, ry: 22, rotation: -18, tint: 0.24, layer: 'back' },
      { cx: 114, cy: 88, rx: 30, ry: 24, rotation: -8, tint: 0.08, layer: 'back' },
      { cx: 144, cy: 102, rx: 28, ry: 22, rotation: 12, tint: 0.18, layer: 'back' },
      { cx: 78, cy: 126, rx: 22, ry: 18, rotation: -22, tint: 0.28, layer: 'front' },
      { cx: 106, cy: 118, rx: 26, ry: 20, rotation: -6, tint: 0.1, layer: 'front' },
      { cx: 132, cy: 119, rx: 26, ry: 20, rotation: 6, tint: 0.08, layer: 'front' },
      { cx: 159, cy: 125, rx: 22, ry: 18, rotation: 20, tint: 0.22, layer: 'front' },
      { cx: 117, cy: 132, rx: 24, ry: 17, rotation: 0, tint: 0.12, layer: 'front' },
    ]
  }

  return [
    { cx: 78, cy: 110, rx: 24, ry: 19, rotation: -18, tint: 0.24, layer: 'back' },
    { cx: 100, cy: 90, rx: 30, ry: 24, rotation: -12, tint: 0.12, layer: 'back' },
    { cx: 128, cy: 84, rx: 32, ry: 25, rotation: 6, tint: 0.06, layer: 'back' },
    { cx: 154, cy: 101, rx: 28, ry: 22, rotation: 16, tint: 0.18, layer: 'back' },
    { cx: 60, cy: 119, rx: 18, ry: 14, rotation: -22, tint: 0.28, layer: 'back' },
    { cx: 177, cy: 118, rx: 18, ry: 14, rotation: 20, tint: 0.22, layer: 'back' },
    { cx: 67, cy: 130, rx: 21, ry: 16, rotation: -18, tint: 0.3, layer: 'front' },
    { cx: 95, cy: 121, rx: 26, ry: 20, rotation: -10, tint: 0.12, layer: 'front' },
    { cx: 120, cy: 114, rx: 29, ry: 21, rotation: 0, tint: 0.08, layer: 'front' },
    { cx: 146, cy: 118, rx: 26, ry: 20, rotation: 8, tint: 0.14, layer: 'front' },
    { cx: 169, cy: 132, rx: 21, ry: 16, rotation: 18, tint: 0.24, layer: 'front' },
    { cx: 121, cy: 134, rx: 24, ry: 18, rotation: 2, tint: 0.1, layer: 'front' },
  ]
}

function getBranches(stage: PlantStage): BranchSpec[] {
  if (stage === 'seed') {
    return []
  }

  if (stage === 'sprout') {
    return [
      { d: 'M 118 146 C 112 142 108 139 104 136', width: 2.4, tint: 0.1 },
      { d: 'M 118 144 C 124 140 128 137 132 134', width: 2.4, tint: 0.08 },
    ]
  }

  if (stage === 'sapling') {
    return [
      { d: 'M 118 140 C 107 133 96 128 87 123', width: 3.4, tint: 0.1 },
      { d: 'M 118 134 C 128 128 139 123 149 118', width: 3.2, tint: 0.08 },
      { d: 'M 118 125 C 112 118 107 112 103 105', width: 2.8, tint: 0.15 },
      { d: 'M 118 121 C 124 115 129 110 134 103', width: 2.8, tint: 0.12 },
    ]
  }

  if (stage === 'mature') {
    return [
      { d: 'M 118 146 C 102 137 87 131 72 126', width: 4.4, tint: 0.1 },
      { d: 'M 118 141 C 131 132 145 125 159 118', width: 4.2, tint: 0.08 },
      { d: 'M 118 128 C 109 117 100 106 94 94', width: 3.3, tint: 0.16 },
      { d: 'M 118 122 C 126 112 134 102 141 92', width: 3.2, tint: 0.14 },
      { d: 'M 117 112 C 113 104 110 97 109 89', width: 2.6, tint: 0.18 },
      { d: 'M 120 108 C 124 101 128 94 131 86', width: 2.4, tint: 0.18 },
      { d: 'M 95 95 C 90 91 86 87 82 84', width: 1.7, tint: 0.22 },
      { d: 'M 141 93 C 146 89 151 85 155 82', width: 1.7, tint: 0.22 },
    ]
  }

  return [
    { d: 'M 118 146 C 99 138 80 132 62 128', width: 4.8, tint: 0.1 },
    { d: 'M 118 142 C 134 133 152 125 169 119', width: 4.6, tint: 0.08 },
    { d: 'M 118 127 C 106 115 94 102 86 89', width: 3.7, tint: 0.16 },
    { d: 'M 118 121 C 129 110 140 98 150 86', width: 3.6, tint: 0.14 },
    { d: 'M 117 108 C 111 98 106 89 104 80', width: 2.8, tint: 0.2 },
    { d: 'M 120 105 C 126 96 133 87 139 77', width: 2.8, tint: 0.2 },
    { d: 'M 88 89 C 82 84 77 80 72 77', width: 1.9, tint: 0.24 },
    { d: 'M 150 86 C 156 81 161 77 166 73', width: 1.9, tint: 0.24 },
  ]
}

function getFruits(stage: PlantStage, fertilizerPct: number): FruitSpec[] {
  if (stage === 'seed' || stage === 'sprout' || stage === 'sapling') {
    return []
  }

  if (stage === 'mature') {
    return [
      { cx: 95, cy: 122, r: 4.4, tilt: -10, kind: 'bud' },
      { cx: 141, cy: 117, r: 4.6, tilt: 12, kind: 'bud' },
      { cx: 119, cy: 96, r: 4.1, tilt: 0, kind: 'blossom' },
    ]
  }

  const fruits: FruitSpec[] = [
    { cx: 86, cy: 129, r: 4.8, tilt: -10, kind: 'apple' },
    { cx: 103, cy: 106, r: 4.4, tilt: -6, kind: 'bud' },
    { cx: 124, cy: 117, r: 5, tilt: 6, kind: 'apple' },
    { cx: 151, cy: 123, r: 4.9, tilt: 12, kind: 'apple' },
    { cx: 137, cy: 91, r: 4.5, tilt: 0, kind: 'blossom' },
    { cx: 97, cy: 89, r: 4.4, tilt: 0, kind: 'blossom' },
  ]

  if (fertilizerPct > 0.44) {
    fruits.push({ cx: 118, cy: 98, r: 4.3, tilt: 2, kind: 'bud' })
  }

  if (fertilizerPct > 0.58) {
    fruits.push({ cx: 118, cy: 113, r: 5.1, tilt: 2, kind: 'apple' })
  }

  if (fertilizerPct > 0.72) {
    fruits.push({ cx: 160, cy: 103, r: 4.2, tilt: 10, kind: 'blossom' })
  }

  return fruits
}

function buildCanopyPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tint: number,
): string {
  const swell = 0.08 + tint * 0.12
  const left = cx - rx
  const right = cx + rx
  const top = cy - ry
  const bottom = cy + ry

  return [
    `M ${cx} ${top}`,
    `C ${cx + rx * 0.46} ${cy - ry * (1.2 - swell)} ${right + rx * 0.12} ${cy - ry * 0.36} ${right} ${cy - ry * 0.04}`,
    `C ${right + rx * 0.06} ${cy + ry * 0.2} ${cx + rx * 0.62} ${bottom + ry * 0.16} ${cx + rx * 0.14} ${bottom}`,
    `C ${cx - rx * 0.14} ${bottom + ry * 0.18} ${left - rx * 0.08} ${cy + ry * 0.4} ${left} ${cy + ry * 0.04}`,
    `C ${left - rx * 0.1} ${cy - ry * 0.26} ${cx - rx * 0.62} ${cy - ry * (1.08 - swell * 0.3)} ${cx} ${top}`,
    'Z',
  ].join(' ')
}

function renderCanopyBlob(
  spec: CanopySpec,
  colors: { leaf: string; leafShadow: string; leafHighlight: string; leafDamage: string },
  droop: number,
) {
  const fill = mixHex(colors.leaf, colors.leafDamage, droop * (0.22 + spec.tint * 0.4))
  const shadow = mixHex(colors.leafShadow, colors.leafDamage, droop * 0.18)
  const underside = mixHex(shadow, colors.leafDamage, 0.12 + droop * 0.18)
  const bodyY = spec.cy + droop * 3
  const shadowY = spec.cy + 3
  const silhouette = buildCanopyPath(spec.cx, bodyY, spec.rx, spec.ry, spec.tint)
  const shadowSilhouette = buildCanopyPath(spec.cx + 2, shadowY, spec.rx, spec.ry, spec.tint)
  return (
    <G key={`${spec.layer}-${spec.cx}-${spec.cy}`}>
      <Path
        d={shadowSilhouette}
        fill={withAlpha(shadow, 0.18)}
        transform={`rotate(${spec.rotation} ${spec.cx + 2} ${shadowY})`}
      />
      <Path
        d={silhouette}
        fill={fill}
        transform={`rotate(${spec.rotation + droop * 4} ${spec.cx} ${bodyY})`}
      />
      <Ellipse
        cx={spec.cx + spec.rx * 0.14}
        cy={spec.cy + spec.ry * 0.24 + droop * 3.5}
        fill={withAlpha(underside, 0.18 + spec.tint * 0.04)}
        rx={spec.rx * 0.76}
        ry={spec.ry * 0.5}
        transform={`rotate(${spec.rotation + 8} ${spec.cx} ${spec.cy})`}
      />
      <Ellipse
        cx={spec.cx + spec.rx * 0.22}
        cy={spec.cy + spec.ry * 0.04}
        fill={withAlpha(shadow, 0.1)}
        rx={spec.rx * 0.42}
        ry={spec.ry * 0.34}
        transform={`rotate(${spec.rotation + 4} ${spec.cx} ${spec.cy})`}
      />
      <Ellipse
        cx={spec.cx - spec.rx * 0.16}
        cy={spec.cy - spec.ry * 0.2}
        fill={withAlpha(colors.leafHighlight, 0.2)}
        rx={spec.rx * 0.58}
        ry={spec.ry * 0.42}
        transform={`rotate(${spec.rotation - 10} ${spec.cx} ${spec.cy})`}
      />
    </G>
  )
}

function renderFruit(
  spec: FruitSpec,
  colors: { apple: string; appleShadow: string; appleHighlight: string; blossom: string; blossomCenter: string },
) {
  if (spec.kind === 'bud') {
    return (
      <G key={`bud-${spec.cx}-${spec.cy}`}>
        <Path
          d={`M ${spec.cx} ${spec.cy - spec.r + 1} C ${spec.cx + spec.tilt * 0.08} ${spec.cy - spec.r - 1} ${spec.cx + 1.2} ${spec.cy - spec.r - 3} ${spec.cx + 1.2} ${spec.cy - spec.r - 5}`}
          fill="none"
          stroke="#6b5337"
          strokeLinecap="round"
          strokeWidth="1.3"
        />
        <Ellipse
          cx={spec.cx + 0.8}
          cy={spec.cy + 1.2}
          fill={withAlpha(colors.appleShadow, 0.16)}
          rx={spec.r * 0.72}
          ry={spec.r}
          transform={`rotate(${spec.tilt} ${spec.cx + 0.8} ${spec.cy + 1.2})`}
        />
        <Ellipse
          cx={spec.cx}
          cy={spec.cy}
          fill={mixHex(colors.blossom, colors.blossomCenter, 0.18)}
          rx={spec.r * 0.68}
          ry={spec.r * 0.92}
          transform={`rotate(${spec.tilt} ${spec.cx} ${spec.cy})`}
        />
        <Ellipse
          cx={spec.cx - spec.r * 0.18}
          cy={spec.cy - spec.r * 0.24}
          fill={withAlpha('#ffffff', 0.22)}
          rx={spec.r * 0.24}
          ry={spec.r * 0.32}
          transform={`rotate(${spec.tilt - 6} ${spec.cx} ${spec.cy})`}
        />
      </G>
    )
  }

  if (spec.kind === 'blossom') {
    return (
      <G key={`blossom-${spec.cx}-${spec.cy}`}>
        <Circle cx={spec.cx + 0.8} cy={spec.cy + 1.2} fill={withAlpha(colors.appleShadow, 0.12)} r={spec.r * 0.92} />
        <Circle cx={spec.cx - spec.r * 0.8} cy={spec.cy} fill={colors.blossom} r={spec.r * 0.62} />
        <Circle cx={spec.cx + spec.r * 0.8} cy={spec.cy} fill={colors.blossom} r={spec.r * 0.62} />
        <Circle cx={spec.cx} cy={spec.cy - spec.r * 0.7} fill={colors.blossom} r={spec.r * 0.62} />
        <Circle cx={spec.cx} cy={spec.cy + spec.r * 0.7} fill={colors.blossom} r={spec.r * 0.62} />
        <Circle cx={spec.cx} cy={spec.cy} fill={colors.blossomCenter} r={spec.r * 0.42} />
      </G>
    )
  }

  return (
    <G key={`apple-${spec.cx}-${spec.cy}`}>
      <Path
        d={`M ${spec.cx} ${spec.cy - spec.r + 1} C ${spec.cx + spec.tilt * 0.1} ${spec.cy - spec.r - 2} ${spec.cx + 1.5} ${spec.cy - spec.r - 4} ${spec.cx + 1.5} ${spec.cy - spec.r - 6}`}
        fill="none"
        stroke="#6b5337"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <Circle cx={spec.cx + 1} cy={spec.cy + 1.5} fill={withAlpha(colors.appleShadow, 0.18)} r={spec.r} />
      <Circle cx={spec.cx} cy={spec.cy} fill={colors.apple} r={spec.r} />
      <Ellipse
        cx={spec.cx + spec.r * 0.24}
        cy={spec.cy + spec.r * 0.34}
        fill={withAlpha(colors.appleShadow, 0.18)}
        rx={spec.r * 0.56}
        ry={spec.r * 0.44}
        transform={`rotate(${spec.tilt + 12} ${spec.cx} ${spec.cy})`}
      />
      <Circle cx={spec.cx - spec.r * 0.3} cy={spec.cy - spec.r * 0.28} fill={withAlpha(colors.appleHighlight, 0.24)} r={spec.r * 0.38} />
      <Ellipse
        cx={spec.cx - spec.r * 0.12}
        cy={spec.cy - spec.r * 0.08}
        fill={withAlpha('#ffffff', 0.08)}
        rx={spec.r * 0.86}
        ry={spec.r * 0.74}
      />
    </G>
  )
}

function renderSeed(colors: { shoot: string; seed: string; shadow: string }, droop: number) {
  return (
    <G>
      <Ellipse cx="118" cy="160" fill={withAlpha(colors.shadow, 0.16)} rx="17" ry="6" />
      <Path
        d={`M 117 164 C ${116 - droop * 0.6} 170 ${114 - droop} 177 111 184`}
        fill="none"
        opacity={0.7}
        stroke={mixHex(colors.shoot, '#b7d5a1', 0.48)}
        strokeLinecap="round"
        strokeWidth="2"
      />
      <Path
        d={`M 118 160 C ${118 + droop * 0.8} 154 ${119 + droop * 1.6} 148 119 142`}
        fill="none"
        stroke={colors.shoot}
        strokeLinecap="round"
        strokeWidth="4"
      />
      <Ellipse cx="118" cy="164" fill={colors.seed} rx="10" ry="6.5" />
      <Circle cx="119" cy="141" fill={colors.shoot} r="4.5" />
    </G>
  )
}

function renderGrassClump(
  x: number,
  y: number,
  height: number,
  color: string,
  opacity: number,
) {
  return (
    <G key={`grass-${x}-${y}`} opacity={opacity}>
      <Path d={`M ${x} ${y} C ${x - 2} ${y - height * 0.56} ${x - 1} ${y - height} ${x - 4} ${y - height * 1.16}`} fill="none" stroke={color} strokeLinecap="round" strokeWidth="1.6" />
      <Path d={`M ${x} ${y} C ${x + 1} ${y - height * 0.48} ${x + 1} ${y - height * 0.9} ${x} ${y - height * 1.24}`} fill="none" stroke={color} strokeLinecap="round" strokeWidth="1.6" />
      <Path d={`M ${x} ${y} C ${x + 2} ${y - height * 0.56} ${x + 3} ${y - height} ${x + 6} ${y - height * 1.12}`} fill="none" stroke={color} strokeLinecap="round" strokeWidth="1.6" />
    </G>
  )
}

function renderSprout(
  colors: {
    shoot: string
    leaf: string
    leafHighlight: string
    leafShadow: string
    leafDamage: string
  },
  droop: number,
) {
  const leftLeaf = 'M 118 141 C 112 136 105 134 99 132 C 101 124 108 121 116 124 C 119 129 119 135 118 141 Z'
  const rightLeaf = 'M 118 140 C 124 136 131 133 137 131 C 135 123 128 120 120 123 C 117 128 117 134 118 140 Z'
  return (
    <G>
      <Path
        d={`M 118 160 C ${116 - droop} 152 ${116 - droop * 2} 141 118 128`}
        fill="none"
        opacity={0.92}
        stroke={colors.shoot}
        strokeLinecap="round"
        strokeWidth="4.5"
      />
      <Path d={leftLeaf} fill={mixHex(colors.leaf, colors.leafDamage, droop * 0.22)} />
      <Path d={leftLeaf} fill={withAlpha(colors.leafHighlight, 0.16)} />
      <Path d={rightLeaf} fill={mixHex(colors.leaf, colors.leafDamage, droop * 0.22)} />
      <Path d={rightLeaf} fill={withAlpha(colors.leafHighlight, 0.16)} />
      <Path d="M 118 140 C 111 135 105 132 100 130" fill="none" stroke={withAlpha(colors.leafShadow, 0.18)} strokeLinecap="round" strokeWidth="1.2" />
      <Path d="M 118 139 C 125 134 131 131 136 129" fill="none" stroke={withAlpha(colors.leafShadow, 0.18)} strokeLinecap="round" strokeWidth="1.2" />
    </G>
  )
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
        withTiming(-1, { duration: 2800 }),
        withTiming(0.45, { duration: 2200 }),
        withTiming(1, { duration: 3000 }),
        withTiming(-0.35, { duration: 2400 }),
      ),
      -1,
      false,
    )
  }, [sway])

  const stageKey = isPlantStage(stage) ? stage : 'seed'
  const healthPct = clamp01(health / 100)
  const droop = clamp01(1 - healthPct)
  const stressSeverity = clamp01((72 - health) / 52)
  const waterPct = clamp01(totalWater / 140)
  const sunPct = clamp01(totalSun / 140)
  const fertilizerPct = clamp01(totalFertilizer / 140)
  const rootsPct = clamp01(totalRoots / 140)
  const accent = SCENE_ACCENTS[skinId] ?? SCENE_ACCENTS.fruit
  const isNightSkin = skinId === 'night'
  const isAppleTree = speciesId === 'starter-fern' || speciesId.includes('fruit') || speciesId.includes('apple')

  const bark = mixHex('#8d6745', '#6b4a32', rootsPct * 0.34)
  const barkShadow = mixHex('#573923', theme.shadow, 0.48)
  const leaf = mixHex('#5d9e51', '#2d6d34', 0.36 + sunPct * 0.28)
  const leafHighlight = mixHex('#d8edbe', '#9ed07d', 0.38 + sunPct * 0.18)
  const leafShadow = mixHex('#2e522a', '#1f311d', 0.38)
  const leafDamage = mixHex('#92714d', '#70563c', droop * 0.7)
  const sprout = mixHex('#7db257', '#5d8e49', sunPct * 0.28)
  const apple = mixHex(mixHex('#df6a52', '#bb2f2c', 0.42 + fertilizerPct * 0.24), '#8a4f34', stressSeverity * 0.58)
  const appleShadow = '#8f1f22'
  const appleHighlight = '#ffd2b3'
  const blossom = mixHex(mixHex('#fff1f0', '#ffd9e5', fertilizerPct * 0.28), '#ccb7a2', stressSeverity * 0.44)
  const blossomCenter = '#e3bc56'
  const root = mixHex('#845b3b', '#614129', rootsPct * 0.42)
  const soilTop = mixHex(accent.soil, '#7a654d', waterPct * 0.2)
  const soilBottom = mixHex('#3f2d21', accent.soil, 0.42)
  const rootOpacity = 0.12 + rootsPct * 0.24
  const soilShadow = withAlpha(theme.shadow, isNightSkin ? 0.34 : 0.18)
  const frameBorder = withAlpha(theme.border, isNightSkin ? 0.5 : 0.88)
  const grass = mixHex(mixHex('#7ba857', leaf, 0.52 + waterPct * 0.16), '#9a8558', stressSeverity * 0.52)
  const grassShadow = mixHex('#4f7037', leafShadow, 0.32)
  const earthTop = mixHex(mixHex(soilTop, '#89684c', waterPct * 0.14), '#8a7051', stressSeverity * 0.28)
  const earthBottom = mixHex(mixHex(soilBottom, '#2f2218', 0.18), '#534336', stressSeverity * 0.2)
  const canopyShadowRx = stageKey === 'seed' ? 16 : stageKey === 'sprout' ? 22 : stageKey === 'sapling' ? 34 : stageKey === 'mature' ? 46 : 54
  const canopyShadowRy = stageKey === 'seed' ? 4 : stageKey === 'sprout' ? 6 : stageKey === 'sapling' ? 9 : stageKey === 'mature' ? 11 : 13
  const canopyShadowOpacity = (isNightSkin ? 0.2 : 0.14) + healthPct * 0.05 + rootsPct * 0.04

  const canopy = getCanopy(stageKey)
  const backCanopy = canopy.filter((item) => item.layer === 'back')
  const frontCanopy = canopy.filter((item) => item.layer === 'front')
  const branches = getBranches(stageKey)
  const fruits = getFruits(stageKey, fertilizerPct)
  const trunkTop = getTrunkTop(stageKey)
  const trunkWidth = getTrunkWidth(stageKey)
  const visibleBackCanopy = backCanopy.filter((_, index) => {
    if (stressSeverity < 0.38) return true
    if (stressSeverity < 0.62) return index % 3 !== 1
    return index % 2 === 0
  })
  const visibleFrontCanopy = frontCanopy.filter((_, index) => {
    if (stressSeverity < 0.32) return true
    if (stressSeverity < 0.55) return index !== frontCanopy.length - 1
    if (stressSeverity < 0.78) return index % 2 === 0
    return index === 1 || index === Math.max(0, frontCanopy.length - 2)
  })
  const visibleFruits = fruits.filter((fruit, index) => {
    if (stressSeverity < 0.45) return true
    if (fruit.kind === 'blossom') return stressSeverity < 0.7
    return index % 2 === 0
  })

  const plantMotionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: droop * 4 - rootsPct + stressSeverity * 2 },
      { rotate: `${-stressSeverity * 1.4 + sway.value * (0.28 + healthPct * 0.32)}deg` },
    ],
  }))

  const trunkPath = `M 118 160 C ${112 - droop * 3} 146 ${112 - droop * 4} 127 118 ${trunkTop} C ${124 + droop * 3} 126 ${124 + droop * 2} 145 118 160 Z`

  return (
    <View
      style={[
        styles.frame,
        { height, borderColor: frameBorder },
        typeof width === 'undefined' ? styles.aspect : { width },
        style,
      ]}
    >
      <Svg
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        width="100%"
      >
        <Defs>
          <LinearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={accent.skyTop} />
            <Stop offset="1" stopColor={accent.skyBottom} />
          </LinearGradient>
          <LinearGradient id="soilGradient" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={earthTop} />
            <Stop offset="1" stopColor={earthBottom} />
          </LinearGradient>
          <LinearGradient id="grassGradient" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={mixHex(grass, '#a8cb76', 0.24)} />
            <Stop offset="1" stopColor={grassShadow} />
          </LinearGradient>
        </Defs>

        <Rect fill="url(#skyGradient)" height={VIEWBOX_HEIGHT} rx={24} width={VIEWBOX_WIDTH} />
        <Ellipse cx="118" cy="55" fill={withAlpha(accent.haze, isNightSkin ? 0.22 : 0.84)} rx="84" ry="56" />
        <Ellipse cx="118" cy="205" fill={soilShadow} rx="86" ry="11" />
        <Ellipse cx="118" cy="184" fill={withAlpha('#ecdfcb', isNightSkin ? 0.06 : 0.32)} rx="96" ry="18" />

        <Path
          d="M 68 143 C 86 118 149 118 168 143"
          fill="none"
          opacity={0.22 + waterPct * 0.12}
          stroke={withAlpha('#ffffff', isNightSkin ? 0.16 : 0.48)}
          strokeLinecap="round"
          strokeWidth="4"
        />

        <Path
          d="M 0 170 C 36 156 72 151 118 154 C 164 150 199 156 236 171 L 236 220 L 0 220 Z"
          fill="url(#soilGradient)"
        />
        <Path
          d="M 0 164 C 34 150 74 146 118 149 C 162 145 201 150 236 165 L 236 177 C 198 163 158 159 118 162 C 78 159 38 163 0 177 Z"
          fill="url(#grassGradient)"
        />
        <Ellipse
          cx="124"
          cy="169"
          fill={withAlpha(theme.shadow, canopyShadowOpacity)}
          rx={canopyShadowRx}
          ry={canopyShadowRy}
          transform="rotate(-4 124 169)"
        />
        <Path
          d="M 7 164 C 34 156 72 152 118 154 C 162 151 200 156 229 164"
          fill="none"
          opacity={0.24}
          stroke={withAlpha('#f8ffea', isNightSkin ? 0.1 : 0.42)}
          strokeLinecap="round"
          strokeWidth="3"
        />
        <Path
          d="M 14 166 C 32 160 56 157 82 159"
          fill="none"
          opacity={0.28}
          stroke={withAlpha(grassShadow, 0.4)}
          strokeLinecap="round"
          strokeWidth="2"
        />
        <Path
          d="M 154 160 C 181 157 203 159 222 166"
          fill="none"
          opacity={0.26}
          stroke={withAlpha(grassShadow, 0.36)}
          strokeLinecap="round"
          strokeWidth="2"
        />
        <Path d="M 98 159 C 100 170 96 184 90 194" fill="none" opacity={rootOpacity} stroke={root} strokeLinecap="round" strokeWidth="2.3" />
        <Path d="M 118 158 C 117 171 112 187 106 197" fill="none" opacity={rootOpacity + 0.05} stroke={root} strokeLinecap="round" strokeWidth="2.5" />
        <Path d="M 139 159 C 139 171 143 184 148 194" fill="none" opacity={rootOpacity} stroke={root} strokeLinecap="round" strokeWidth="2.3" />
        {renderGrassClump(37, 165, 9, withAlpha(mixHex(grass, '#b9d98e', 0.26), 0.78), 0.86)}
        {renderGrassClump(72, 162, 7, withAlpha(mixHex(grass, '#c2dd94', 0.22), 0.72), 0.74)}
        {renderGrassClump(176, 164, 8, withAlpha(mixHex(grass, '#b8d38c', 0.24), 0.72), 0.78)}
        {renderGrassClump(205, 167, 7, withAlpha(mixHex(grass, '#bad796', 0.18), 0.68), 0.7)}
        <Ellipse cx="58" cy="170" fill={withAlpha('#8f7a63', 0.42)} rx="3.2" ry="1.6" />
        <Ellipse cx="191" cy="171" fill={withAlpha('#8b755e', 0.38)} rx="2.6" ry="1.4" />
        <Ellipse cx="148" cy="168" fill={withAlpha('#a88f76', 0.26)} rx="2.4" ry="1.2" />
      </Svg>

      <Animated.View pointerEvents="none" style={[styles.plantLayer, plantMotionStyle]}>
        <Svg
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          width="100%"
        >
          {stageKey === 'seed'
            ? renderSeed({ shoot: sprout, seed: soilTop, shadow: barkShadow }, droop)
            : stageKey === 'sprout'
              ? renderSprout(
                {
                  shoot: sprout,
                  leaf,
                  leafHighlight,
                  leafShadow,
                  leafDamage,
                },
                droop,
              )
              : (
                <G>
                  {visibleBackCanopy.map((item) => renderCanopyBlob(
                    item,
                    { leaf, leafShadow, leafHighlight, leafDamage },
                    clamp01(droop + stressSeverity * 0.22),
                  ))}

                  {branches.map((branch, index) => (
                    <Path
                      d={branch.d}
                      fill="none"
                      key={`branch-shadow-${index}`}
                      opacity={0.24}
                      stroke={mixHex(barkShadow, theme.shadow, branch.tint)}
                      strokeLinecap="round"
                      strokeWidth={branch.width + 1.2}
                      transform="translate(1.8 2.2)"
                    />
                  ))}

                  {branches.map((branch, index) => (
                    <Path
                      d={branch.d}
                      fill="none"
                      key={`branch-${index}`}
                      opacity={0.92}
                      stroke={mixHex(bark, barkShadow, branch.tint)}
                      strokeLinecap="round"
                      strokeWidth={branch.width}
                    />
                  ))}

                  <Path d={trunkPath} fill={withAlpha(barkShadow, 0.2)} transform="translate(2.4 3)" />
                  <Path d={trunkPath} fill={bark} />
                  <Path d={trunkPath} fill={withAlpha('#ffffff', 0.08)} />
                  <Path
                    d={`M 120 160 C ${124 + droop * 1.8} 147 ${125 + droop * 1.4} 128 121 ${trunkTop + 4}`}
                    fill="none"
                    opacity={0.26}
                    stroke={mixHex(barkShadow, '#3f2619', 0.16)}
                    strokeLinecap="round"
                    strokeWidth={trunkWidth * 0.36}
                  />
                  <Path
                    d={`M 118 160 C ${116 - droop * 2} 147 ${116 - droop * 3} 127 118 ${trunkTop + 4}`}
                    fill="none"
                    stroke={withAlpha('#f7d8b3', 0.16)}
                    strokeLinecap="round"
                    strokeWidth={trunkWidth * 0.28}
                  />
                  <Path
                    d={`M 116 158 C ${114 - droop} 146 ${114 - droop * 0.8} 131 116 ${trunkTop + 11}`}
                    fill="none"
                    opacity={0.22}
                    stroke={withAlpha('#4c3122', 0.3)}
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                  <Path
                    d={`M 121 158 C ${121 + droop * 0.5} 148 ${121 + droop * 0.6} 133 121 ${trunkTop + 10}`}
                    fill="none"
                    opacity={0.18}
                    stroke={withAlpha('#4c3122', 0.24)}
                    strokeLinecap="round"
                    strokeWidth="1.2"
                  />

                  {visibleFrontCanopy.map((item) => renderCanopyBlob(
                    item,
                    { leaf, leafShadow, leafHighlight, leafDamage },
                    clamp01(droop + stressSeverity * 0.22),
                  ))}

                  {visibleFruits.map((fruit) => renderFruit(
                    fruit,
                    {
                      apple,
                      appleShadow,
                      appleHighlight,
                      blossom,
                      blossomCenter,
                    },
                  ))}

                  {stressSeverity > 0.36 ? (
                    <G>
                      <Path
                        d="M 96 165 C 92 168 88 170 84 170"
                        fill="none"
                        opacity={0.46}
                        stroke={mixHex(leafDamage, '#5f4a34', stressSeverity * 0.3)}
                        strokeLinecap="round"
                        strokeWidth="2.4"
                      />
                      <Path
                        d="M 140 166 C 144 169 149 171 153 171"
                        fill="none"
                        opacity={0.46}
                        stroke={mixHex(leafDamage, '#5f4a34', stressSeverity * 0.3)}
                        strokeLinecap="round"
                        strokeWidth="2.4"
                      />
                    </G>
                  ) : null}

                  {isAppleTree ? (
                    <G>
                      <Ellipse cx="118" cy="158" fill={withAlpha(barkShadow, 0.12)} rx="14" ry="6" />
                      <Ellipse cx="118" cy="160" fill={withAlpha('#f7d8b3', 0.08)} rx="7" ry="2.6" />
                    </G>
                  ) : null}
                </G>
              )}
        </Svg>
      </Animated.View>

      {stressSeverity > 0.22 ? (
        <Svg
          height="100%"
          pointerEvents="none"
          preserveAspectRatio="xMidYMid meet"
          style={styles.plantLayer}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          width="100%"
        >
          {stressSeverity > 0.38 ? (
            <G>
              <Path
                d="M 83 177 C 90 173 98 174 105 177"
                fill="none"
                opacity={0.34}
                stroke={mixHex(earthBottom, '#75614a', stressSeverity * 0.4)}
                strokeLinecap="round"
                strokeWidth="1.8"
              />
              <Path
                d="M 131 176 C 139 173 146 173 154 177"
                fill="none"
                opacity={0.34}
                stroke={mixHex(earthBottom, '#75614a', stressSeverity * 0.4)}
                strokeLinecap="round"
                strokeWidth="1.8"
              />
              <Path
                d="M 116 178 C 118 174 122 173 126 175"
                fill="none"
                opacity={0.28}
                stroke={mixHex(earthBottom, '#75614a', stressSeverity * 0.34)}
                strokeLinecap="round"
                strokeWidth="1.4"
              />
            </G>
          ) : null}

          {stressSeverity > 0.48 ? (
            <G>
              <Ellipse cx="88" cy="171" fill={withAlpha(leafDamage, 0.48)} rx="4.5" ry="2.4" transform="rotate(-24 88 171)" />
              <Ellipse cx="148" cy="172" fill={withAlpha(leafDamage, 0.46)} rx="4.1" ry="2.2" transform="rotate(18 148 172)" />
              {stageKey === 'mature' || stageKey === 'bloom' ? (
                <Circle cx="130" cy="173" fill={withAlpha(apple, 0.62)} r="3.4" />
              ) : null}
            </G>
          ) : null}
        </Svg>
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
  plantLayer: {
    ...StyleSheet.absoluteFillObject,
  },
})
