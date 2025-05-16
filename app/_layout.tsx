if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = ((callback: () => void) => setTimeout(callback, 0)) as any;
}
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import Onboarding from './onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionProvider } from './context/SessionContext';
import { Platform } from 'react-native';
if (Platform.OS === 'web') {
  import('../assets/styles/mapbox.css');
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setShowOnboarding(seen !== 'true'); // true if not seen
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || showOnboarding === null) return null;

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {showOnboarding ? (
          <Onboarding />
        ) : (
          <>
            <Stack>
              <Stack.Screen name="login/login" options={{ headerShown: false }} />
              <Stack.Screen name="signup/signup" options={{ headerShown: false }} />
              <Stack.Screen name="pages/history" options={{ headerShown: false }} />
              <Stack.Screen name="pages/rates" options={{ headerShown: false }} />
              <Stack.Screen name="pages/pickup" options={{ headerShown: false }} />
              <Stack.Screen name="pages/dropoff" options={{ headerShown: false }} />
              <Stack.Screen name="parcel/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="parcel/parcels" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </>
        )}
      </ThemeProvider>
    </SessionProvider>
  );
}