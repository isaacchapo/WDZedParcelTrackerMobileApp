import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/assets/styles/trackStyles';
import { useSession } from '../context/SessionContext';
import { logActivity } from '@/utils/logActivity';

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

export default function TrackScreen() {
  const [tracking, setTracking] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useSession();
  const [recentSearches, setRecentSearches] = useState<Parcel[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      if (!user) {
        router.replace('/login/login');
      } else {
        await logActivity(user?.id, 'Viewed Track Screen');
        fetchRecentSearches(user?.id);
      }
    };
    checkAuth();
  }, []);

  const fetchRecentSearches = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentSearches(data as Parcel[]);
    } catch (error) {
      console.error('Error fetching recent searches:', error);
    }
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

    setLoading(true);
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
        // Try to fetch from external tracking API or create new entry
        // For demo, create a new parcel with pending status
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
          router.push(`/parcel/${(insertedParcel[0] as Parcel).id}`);
        }
      }
    } catch (error) {
      console.error('Error tracking parcel:', error);
      Alert.alert('Error', 'Failed to track parcel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRecentItem = ({ item }: { item: Parcel }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => router.push(`/parcel/${item.id}`)}
    >
      <View style={styles.recentInfo}>
        <Text style={styles.recentTracking}>#{item.tracking_number}</Text>
        <Text style={styles.recentDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{item.status}</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Parcel</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchTitle}>Enter Tracking Number</Text>
        <Text style={styles.searchSubtitle}>
          Enter your tracking number to get the latest status updates
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter tracking number"
            value={tracking}
            onChangeText={setTracking}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.trackButton}
            onPress={handleTrackParcel}
            disabled={loading || !tracking.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.trackButtonText}>Track</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Recent Tracking</Text>

        {recentSearches.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No recent tracking history</Text>
          </View>
        ) : (
          <FlatList
            data={recentSearches}
            renderItem={renderRecentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recentList}
          />
        )}
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#0096FF" />
          <Text style={styles.helpText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}