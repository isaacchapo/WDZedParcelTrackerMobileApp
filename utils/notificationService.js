import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Function to register for push notifications
export async function registerForPushNotifications() {
  let token;
  
  // Check if device is a physical device (not an emulator/simulator)
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

// Function to save the token to Supabase
export async function saveUserPushToken(userId, token) {
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

// Function to schedule a local test notification
export async function scheduleTestNotification(title, body, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: { seconds: 2 },
  });
}

// Function to add notification listeners
export function useNotificationListeners(navigation) {
  return {
    // When notification is received while app is in foreground
    addNotificationReceivedListener: (callback) => {
      return Notifications.addNotificationReceivedListener(callback);
    },
    
    // When user taps on a notification
    addNotificationResponseReceivedListener: () => {
      return Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        
        // Handle navigation based on notification type
        if (data.type === 'parcel-update') {
          navigation && navigation.navigate('ParcelDetail', { parcelId: data.parcelId });
        } else if (data.type === 'issue-response') {
          navigation && navigation.navigate('ReportDetail', { reportId: data.reportId });
        }
      });
    }
  };
}