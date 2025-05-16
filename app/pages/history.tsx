import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { useSession } from '../context/SessionContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

export default function HistoryScreen() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchParcels = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching parcel history:', error);
      } else {
        setParcels(data || []);
      }
      setLoading(false);
    };

    fetchParcels();
  }, [user]);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#4CAF50';
      case 'in transit': return '#FF9800';
      case 'pending': return '#9E9E9E';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0096FF" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.heading}>Tracking History</Text>
        <Text style={styles.subHeading}>{parcels.length} parcels found</Text>
      </View>

      {parcels.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No tracking history found</Text>
          <Text style={styles.emptyStateSubtext}>Your tracking history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={parcels}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.tracking}>{item.tracking_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{item.current_location}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>ETA</Text>
                  <Text style={styles.infoValue}>{new Date(item.eta).toLocaleDateString()}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Amount</Text>
                  <Text style={styles.infoValue}>ZMW {item.amount_paid.toFixed(2)}</Text>
                </View>

                {item.carrier && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Carrier</Text>
                    <Text style={styles.infoValue}>{item.carrier}</Text>
                  </View>
                )}

                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA'
  },
  header: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0096FF',
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 16,
    color: '#757575',
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5FAFF',
  },
  tracking: {
    fontWeight: '600',
    fontSize: 16,
    color: '#0096FF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  infoContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#757575',
    fontSize: 14,
  },
  infoValue: {
    color: '#212121',
    fontSize: 14,
    fontWeight: '500',
  },
  dateRow: {
    marginTop: 4,
  },
  backButton: {
    marginRight: 16,
  },
  dateText: {
    color: '#9E9E9E',
    fontSize: 12,
    textAlign: 'right',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    color: '#0096FF',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0096FF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#757575',
  }
});