import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabaseClient';

interface Parcel {
  id: string;
  tracking_number: string;
  status: string;
  current_location: string;
  destination?: string;
  carrier?: string;
  eta: string;
  amount_paid: number;
  created_at: string;
}

const STATUS_OPTIONS = [
  'Pending',
  'Processing',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Ready for Pickup',
  'On Hold',
  'Delayed',
];

export default function ParcelListScreen() {
  const router = useRouter();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchParcelsByStatus();
  }, [selectedStatuses]);

  const fetchParcelsByStatus = async (): Promise<void> => {
    setLoading(true);
    try {
      let query = supabase.from('parcels').select('*');
  
      if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_OPTIONS.length) {
        query = query.in('status', selectedStatuses);
      }
      console.log('Filtering parcels with statuses:', selectedStatuses);

      const { data, error } = await query;
      if (error) throw error;
      setParcels(data as Parcel[]);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      Alert.alert('Error', 'Failed to load parcels');
    } finally {
      setLoading(false);
    }
  };
  

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter by Status</Text>
      <View style={styles.filtersContainer}>
        {STATUS_OPTIONS.map(status => {
          const selected = selectedStatuses.includes(status);
          return (
            <TouchableOpacity
              key={status}
              onPress={() => toggleStatus(status)}
              style={[styles.filterButton, selected && styles.filterButtonSelected]}
            >
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0096FF" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.listContainer}>
          {parcels.length === 0 ? (
            <Text style={styles.noParcelsText}>No parcels found for selected statuses.</Text>
          ) : (
            parcels.map(parcel => (
              <TouchableOpacity
                key={parcel.id}
                style={styles.parcelCard}
                onPress={() => router.push(`/parcel/${parcel.id}`)}
              >
                <Text style={styles.trackingNumber}>{parcel.tracking_number}</Text>
                <Text>Status: <Text style={styles.statusText}>{parcel.status}</Text></Text>
                <Text>Current Location: {parcel.current_location}</Text>
                <Text>ETA: {new Date(parcel.eta).toDateString()}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    margin: 4,
  },
  filterButtonSelected: {
    backgroundColor: '#0096FF',
  },
  filterText: {
    color: '#333',
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  noParcelsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  parcelCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#222',
  },
  statusText: {
    fontWeight: '700',
    color: '#0096FF',
  },
});
