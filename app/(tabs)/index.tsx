import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import homeStyles from '@/assets/styles/homeStyles';
import { supabase } from '@/utils/supabaseClient';
import { logActivity } from '@/utils/logActivity';
import { useSession } from '../context/SessionContext';

// Define interfaces for our data types
interface Parcel {
  id: string;
  user_id: string;
  tracking_number: string;
  status: string;
  current_location: string;
  destination?: string;
  carrier?: string;
  eta: string;
  amount_paid: number;
  created_at: string;
  updated_at?: string;
}

interface ActionItem {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [shipments, setShipments] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [tracking, setTracking] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  // const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const styles = homeStyles;
  const {user} = useSession();

  console.log("user data : " + user?.email);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        router.replace('/login/login');
      } else {
        // setUser(data.user);
        await logActivity(data.user.id, 'Viewed Home Screen');
      }
    };
  
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user]);

  const fetchShipments = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shipments:', error);
        Alert.alert('Error', 'Failed to load your shipments. Please try again.');
      } else {
        setShipments(data as Parcel[] || []);
      }
    } catch (error) {
      console.error('Error in fetchShipments:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchShipments();
    setRefreshing(false);
  };

  const handleTrackParcel = async (): Promise<void> => {
    if (!tracking.trim()) {
      Alert.alert('Error', 'Please enter a tracking number');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to track parcels');
      return;
    }

    setSearchLoading(true);
    try {
      // First check if this tracking number already exists in our database
      const { data: existingParcel, error: searchError } = await supabase
        .from('parcels')
        .select('*')
        .eq('tracking_number', tracking.trim())
        .limit(1);
      
      if (searchError) throw searchError;
      
      if (existingParcel && existingParcel.length > 0) {
        // Parcel exists, navigate to details
        await logActivity(user.id, 'Tracked Existing Parcel', { tracking_number: tracking });
        router.push(`/parcel/${existingParcel[0].id}`);
      } else {
        // Try to fetch from external tracking API 
        // This would be implemented on the backend, but for now we'll simulate with a new entry
        
        // In a real implementation, you would call your Supabase Function here
        // const { data: trackingData, error: trackingError } = await supabase.functions.invoke('track-parcel', {
        //   body: { tracking_number: tracking.trim() }
        // });
        
        // For demo purposes, create a new parcel with pending status
        const newParcel = {
          user_id: user.id,
          tracking_number: tracking.trim(),
          status: 'Pending',
          current_location: 'Processing Center',
          destination: 'Destination pending',
          carrier: 'Pending carrier verification',
          eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // ETA in 7 days
          amount_paid: 0,
        };
        
        const { data: insertedParcel, error: insertError } = await supabase
          .from('parcels')
          .insert(newParcel)
          .select();
          
        if (insertError) throw insertError;
        
        await logActivity(user.id, 'Added New Parcel', { tracking_number: tracking });
        
        if (insertedParcel && insertedParcel.length > 0) {
          Alert.alert('Success', 'Tracking initiated for your parcel');
          setTracking('');
          await fetchShipments();
          router.push(`/parcel/${(insertedParcel[0] as Parcel).id}`);
        }
      }
    } catch (error) {
      console.error('Error tracking parcel:', error);
      Alert.alert('Error', 'Failed to track parcel. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const navigateToParcelDetails = (parcelId: string): void => {
    router.push(`/parcel/${parcelId}`);
  };

  const navigateToScreen = (screen: string): void => {
    switch(screen) {
      case 'Check Rate':
        router.push('/pages/rates');
        break;
      case 'Pick Up':
        router.push('/pages/pickup');
        break;
      case 'Drop Off':
        router.push('/pages/dropoff');
        break;
      case 'History':
        router.push('/pages/history');
        break;
    }
  };

  // Array of action items for the action row
  const actionItems: ActionItem[] = [
    { label: 'Check Rate', icon: 'monetization-on' },
    { label: 'Pick Up', icon: 'local-shipping' },
    { label: 'Drop Off', icon: 'location-on' },
    { label: 'History', icon: 'history' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.profileRow}>
          {/* Avatar - Make this clickable to go to profile */}
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image
              source={require('../../assets/images/ZPT.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>

          {/* Location Details */}
          <View style={{ marginTop: -25 }}>
            <Text style={styles.trackTitle}>ZED PARCEL TRACKER</Text>
          </View>

          {/* Notification Icon */}
          <TouchableOpacity onPress={() => router.push('/notifications/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.trackTitle}>Let's Track Your Package</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#aaa" />
          <TextInput
            placeholder="Enter your tracking number"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={tracking}
            onChangeText={setTracking}
            autoCapitalize="characters"
          />
          <TouchableOpacity 
            style={homeStyles.searchButton} 
            onPress={handleTrackParcel}
            disabled={searchLoading || !tracking.trim()}
          >
            {searchLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={homeStyles.searchButtonText}>Track</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.actionRow}>
          {actionItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.actionItem}
              onPress={() => navigateToScreen(item.label)}
            >
              <MaterialIcons name={item.icon} size={24} color="white" />
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Shipment</Text>
          {shipments.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/parcel/parcels')}>
              <Text style={homeStyles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
        {loading ? (
          <ActivityIndicator color="#0096FF" style={homeStyles.loader} />
        ) : shipments.length === 0 ? (
          <View style={homeStyles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#aaa" />
            <Text style={homeStyles.emptyStateText}>No current shipments</Text>
            <Text style={homeStyles.emptyStateSubtext}>Track a package to get started</Text>
          </View>
        ) : (
          shipments.slice(0, 1).map((parcel, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card}
              onPress={() => navigateToParcelDetails(parcel.id)}
            >
              <View style={homeStyles.cardHeader}>
                <Text style={styles.cardTitle}>#{parcel.tracking_number}</Text>
                <View style={homeStyles.statusBadge}>
                  <Text style={homeStyles.statusText}>{parcel.status}</Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>
                {parcel.status === 'Delivered' 
                  ? `Delivered on ${new Date(parcel.updated_at || parcel.eta).toDateString()}`
                  : `ETA - ${new Date(parcel.eta).toDateString()}`
                }
              </Text>
              <View style={styles.routeRow}>
                <View style={homeStyles.locationInfo}>
                  <Ionicons name="location-outline" size={16} color="#555" />
                  <Text style={homeStyles.locationText}>From {parcel.current_location}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#555" />
                <View style={homeStyles.locationInfo}>
                  <Ionicons name="flag-outline" size={16} color="#555" />
                  <Text style={homeStyles.locationText}>To {parcel.destination || 'TBD'}</Text>
                </View>
              </View>
              <View style={homeStyles.cardFooter}>
                <Text style={homeStyles.carrierText}>
                  {parcel.carrier || 'Carrier information pending'}
                </Text>
                {parcel.amount_paid > 0 && (
                  <Text style={homeStyles.amountText}>
                    K{parcel.amount_paid.toFixed(2)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Shipments</Text>
          {shipments.length > 1 && (
            <TouchableOpacity onPress={() => router.push('/pages/history')}>
              <Text style={homeStyles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
        {loading ? (
          <ActivityIndicator color="#0096FF" style={homeStyles.loader} />
        ) : shipments.length <= 1 ? (
          <View style={homeStyles.emptyState}>
            <Ionicons name="time-outline" size={32} color="#aaa" />
            <Text style={homeStyles.emptyStateSubtext}>No recent shipments</Text>
          </View>
        ) : (
          shipments.slice(0, 5).map((parcel, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.cardSmall}
              onPress={() => navigateToParcelDetails(parcel.id)}
            >
              <View style={homeStyles.cardSmallContent}>
                <View>
                  <Text style={styles.cardTitle}>#{parcel.tracking_number}</Text>
                  <Text style={homeStyles.cardSmallSubtitle}>
                    {new Date(parcel.created_at).toDateString()}
                  </Text>
                </View>
                <View style={homeStyles.cardSmallRight}>
                  <View style={[homeStyles.statusBadge, homeStyles.statusBadgeSmall]}>
                    <Text style={homeStyles.statusTextSmall}>{parcel.status}</Text>
                  </View>
                  {parcel.amount_paid > 0 && (
                    <Text style={homeStyles.amountText}>K{parcel.amount_paid.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

