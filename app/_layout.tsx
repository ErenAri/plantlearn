import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { getSetting } from '@/db';
import { useDatabase } from '@/hooks/useDatabase';
import '@/i18n';
import i18n from '@/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { ready } = useDatabase();
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

      const ob = await getSetting('onboardingComplete');
      setOnboarded(ob === '1');

      SplashScreen.hideAsync();
    })();
  }, [ready]);

  if (!ready || !langReady || onboarded === null) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!onboarded && <Stack.Screen name="onboarding" />}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
