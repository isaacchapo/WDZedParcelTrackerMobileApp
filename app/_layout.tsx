if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = ((callback: () => void) => setTimeout(callback, 0)) as any;
}
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter  } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React, { useState, useEffect, useRef } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import Onboarding from './onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionProvider, useSession } from './context/SessionContext';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../utils/supabaseClient';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

if (Platform.OS === 'web') {
  import('../assets/styles/mapbox.css');
}

SplashScreen.preventAutoHideAsync();

// Register for push notifications
async function registerForPushNotifications() {
  let token;
  
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  // Create notification channels for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('parcel-updates', {
      name: 'Parcel Status Updates',
      description: 'Notifications for parcel status changes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4287f5',
    });
    
    await Notifications.setNotificationChannelAsync('issue-reports', {
      name: 'Issue Report Updates',
      description: 'Notifications for issue report responses',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f54242',
    });
  }

  // Check and request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for notifications');
    return null;
  }
  
  // Get the token
  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    if (!projectId) {
      throw new Error('Project ID not found');
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId,
    })).data;
    
    console.log('Push token:', token);
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

// Save user push token to Supabase
async function saveUserPushToken(userId: string, token: string) {
  if (!token) return;
  
  const { error } = await supabase
    .from('users')
    .update({ push_token: token })
    .eq('id', userId);
    
  if (error) {
    console.error('Error saving push token:', error);
  } else {
    console.log('Push token saved successfully');
  }
}

function AppContent() {
  const colorScheme = useColorScheme();
  const { session } = useSession();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

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

  // Set up notifications
  useEffect(() => {
    // Only register for notifications if user is logged in
    if (session?.user) {
      registerForPushNotifications().then(token => {
        if (token) {
          saveUserPushToken(session.user.id, token);
        }
      });
    }

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Handle the notification (update UI, state, etc.)
    });
    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      
      // Navigate based on notification type - you'll need to adjust this based on your routing setup
      if (data.type === 'parcel-update' && data.parcelId) {
        router.push(`/parcel/${data.parcelId}`);
      } else if (data.type === 'issue-response' && data.reportId) {
        // Example: router.push(`/reports/${data.reportId}`);
      }
    });
    
    // Clean up on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [session]);

  if (!loaded || showOnboarding === null) return null;

  return (
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
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}