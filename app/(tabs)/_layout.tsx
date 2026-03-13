import { Tabs } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { Icon, type IconName } from '@/components/ui'
import { fontFamily, fontSize, layout, spacing } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.iconWrap,
        {
          backgroundColor: focused ? theme.primaryLight : 'transparent',
          borderColor: focused ? theme.border : 'transparent',
        },
      ]}>
      <Icon
        color={focused ? theme.tabBarActive : theme.tabBarInactive}
        name={name}
        size={18}
      />
    </View>
  )
}

export default function TabLayout() {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: fontSize.xs,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          height: 78,
          paddingBottom: spacing.sm + 2,
          paddingTop: spacing.sm,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="home" />,
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          title: t('tabs.session'),
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="play-circle" />,
        }}
      />
      <Tabs.Screen
        name="plant"
        options={{
          title: t('tabs.plant'),
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="feather" />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: t('tabs.collection'),
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="book-open" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          href: null,
        }}
      />
      {__DEV__ && (
        <Tabs.Screen
          name="db-debug"
          options={{
            title: 'DB Debug',
            href: null,
          }}
        />
      )}
    </Tabs>
  )
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    borderRadius: layout.touchTarget / 2,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  tabItem: {
    paddingVertical: spacing.xs,
  },
})
