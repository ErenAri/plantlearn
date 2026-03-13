import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { dark, light } from '@/constants/Colors';
import { getSetting } from '@/db';
import { loadAudioSetting } from '@/hooks/useAudio';
import { useDatabase } from '@/hooks/useDatabase';
import { loadHapticSetting } from '@/hooks/useHaptics';
import '@/i18n';
import i18n from '@/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { ready } = useDatabase();
  const colors = colorScheme === 'dark' ? dark : light;
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
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
      setLangReady(true);

      await Promise.all([loadAudioSetting(), loadHapticSetting()]);

      const ob = await getSetting('onboardingComplete');
      setOnboarded(ob === '1');

      SplashScreen.hideAsync();
    })();
  }, [ready]);

  if (!ready || !fontsLoaded || !langReady || onboarded === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          {!onboarded && <Stack.Screen name="onboarding" />}
          <Stack.Screen name="placement" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
