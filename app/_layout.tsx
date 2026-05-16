import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { dark, light, type ThemeColors } from '@/constants/Colors';
import { getSetting, setSetting } from '@/db';
import { loadAudioSetting } from '@/hooks/useAudio';
import { useDatabase } from '@/hooks/useDatabase';
import { loadHapticSetting } from '@/hooks/useHaptics';
import { ThemeProvider as AppThemeProvider, type ThemeMode } from '@/hooks/useTheme';
import '@/i18n';
import i18n from '@/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { ready } = useDatabase();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [themeReady, setThemeReady] = useState(false);
  const colors = useMemo<ThemeColors>(() => {
    const activeScheme = themeMode === 'system' ? systemColorScheme ?? 'light' : themeMode;
    return activeScheme === 'dark' ? dark : light;
  }, [systemColorScheme, themeMode]);
  const baseTheme = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark') ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      border: colors.border,
      card: colors.surface,
      notification: colors.accent,
      primary: colors.primary,
      text: colors.text,
    },
  };
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [langReady, setLangReady] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      const savedLang = await getSetting('language');
      if (savedLang && savedLang !== i18n.language) {
        await i18n.changeLanguage(savedLang);
      }
      const savedTheme = await getSetting('themeMode');
      if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system') {
        setThemeMode(savedTheme);
      }
      setLangReady(true);

      await Promise.all([loadAudioSetting(), loadHapticSetting()]);

      const ob = await getSetting('onboardingComplete');
      setOnboarded(ob === '1');

      SplashScreen.hideAsync();
      setThemeReady(true);
    })();
  }, [ready]);

  if (!ready || !fontsLoaded || !langReady || !themeReady || onboarded === null) {
    return null;
  }

  const activeScheme = themeMode === 'system' ? systemColorScheme ?? 'light' : themeMode;
  const statusBarStyle = activeScheme === 'dark' ? 'light' : 'dark';

  const themeContextValue = {
    colors,
    mode: themeMode,
    setMode: async (next: ThemeMode) => {
      setThemeMode(next);
      await setSetting('themeMode', next);
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider value={themeContextValue}>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style={statusBarStyle} />
          <Stack screenOptions={{ headerShown: false }}>
            {!onboarded && <Stack.Screen name="onboarding" />}
            <Stack.Screen name="placement" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
