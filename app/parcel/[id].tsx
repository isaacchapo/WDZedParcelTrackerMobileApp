import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/supabaseClient';
import { useSession } from '../context/SessionContext';
import { logActivity } from '@/utils/logActivity';
import { generateMockTrackingUpdates } from '@/utils/trackingUtils';
import styles from '@/assets/styles/parcelID';
import getStatusIcon from '@/components/getStatutsIcons';
// import ReusableMapComponent from '@/utils/ReusableMapComponent';

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

interface TrackingUpdate {
  location: string;
  status: string;
  timestamp: string;
  note?: string;
}

export default function ParcelScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useSession();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const { data, error } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login/login');
      } else {
        await fetchParcelDetails();
        await logActivity(user.id, 'Viewed Parcel Details', { parcel_id: id as string });
      }
    };

    checkAuth();
  }, [id]);

  const fetchParcelDetails = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!id) {
        Alert.alert('Error', 'Invalid parcel ID');
        router.back();
        return;
      }

      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setParcel(data as Parcel);
      // generateMockTrackingUpdates(data as Parcel);
      setTrackingUpdates(generateMockTrackingUpdates(data as Parcel));
    } catch (error) {
      console.error('Error fetching parcel details:', error);
      Alert.alert('Error', 'Failed to load parcel details');
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = (): void => {
    if (!parcel || !user) return;

    // Open modal
    setModalVisible(true);
  };

  const sendEmail = () => {
    if (!parcel || !user) return;

    if (issueDescription.trim().length === 0) {
      Alert.alert('Please describe the issue before sending.');
      return;
    }

    const subject = encodeURIComponent(`Parcel Issue Report: ${parcel.tracking_number}`);
    const body = encodeURIComponent(
      `Hello Pukuta,\n\n` +
      `I want to report an issue with the parcel having tracking number: ${parcel.tracking_number}\n\n` +
      `Issue Description:\n${issueDescription}\n\n` +
      `Reported by:\nName: ${user.user_metadata?.full_name || user.email}\n` +
      `Email: ${user.email}\n\n` +
      `Thank you.`
    );
    const email = 'pukuta@webdevzm.tech';

    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.canOpenURL(mailtoUrl).then(supported => {
      if (supported) {
        Linking.openURL(mailtoUrl);
        setModalVisible(false);
        setIssueDescription('');
      } else {
        Alert.alert('Could not open the mail app.');
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0096FF" />
        <Text style={styles.loadingText}>Loading parcel details...</Text>
      </View>
    );
  }

  if (!parcel) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>Parcel not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Parcel Details</Text>
        </View>
        {/* <View style={styles.header}> */}
          {/* <ReusableMapComponent
            initialLocation={{
              address: parcel.current_location
            }}
            zoomLevel={16}
            showUserLocation={true}
            showSearch={false}
            onLocationSelect={(location) => {
              setDestination(parcel.destination ?? null);
            }} /> */}
        {/* </View> */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tracking Number</Text>
          <Text style={[styles.detailText, styles.trackingNumber]}>#{parcel.tracking_number}</Text>
          <Text style={styles.detailText}>Status: {parcel.status}</Text>
          <Text style={styles.detailText}>Carrier: {parcel.carrier || 'TBD'}</Text>
          <Text style={styles.detailText}>From: {parcel.current_location}</Text>
          <Text style={styles.detailText}>To: {parcel.destination || 'TBD'}</Text>
          <Text style={styles.detailText}>ETA: {new Date(parcel.eta).toDateString()}</Text>
          {parcel.amount_paid > 0 && (
            <Text style={styles.detailText}>Payment: K{parcel.amount_paid.toFixed(2)}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tracking History</Text>

          {trackingUpdates.map((update, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
              <View style={{ alignItems: 'center', marginRight: 10 }}>
                {getStatusIcon(update.status)}
                {index !== trackingUpdates.length - 1 && (
                  <View style={{ height: 24, width: 2, backgroundColor: '#ccc', marginVertical: 2 }} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.updateStatus, { fontWeight: '600' }]}>{update.status}</Text>
                <Text style={styles.updateLocation}>{update.location}</Text>
                {update.note && <Text style={styles.updateNote}>{update.note}</Text>}
                <Text style={styles.updateTime}>{new Date(update.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>


        <View style={styles.card}>
          <TouchableOpacity onPress={handleReportIssue} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FF6B6B" />
            <Text style={{ marginLeft: 8, color: '#FF6B6B', fontWeight: '600' }}>Report an Issue</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="share-outline" size={20} color="#0096FF" />
            <Text style={{ marginLeft: 8, color: '#0096FF', fontWeight: '600' }}>Share Tracking</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Report Parcel Issue</Text>
            <Text>Tracking Number: {parcel?.tracking_number}</Text>
            <TextInput
              style={{
                height: 100,
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 5,
                marginTop: 12,
                padding: 10,
                textAlignVertical: 'top',
              }}
              multiline={true}
              placeholder="Describe the issue..."
              value={issueDescription}
              onChangeText={setIssueDescription}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setIssueDescription('');
                }}
                style={{ marginRight: 15 }}
              >
                <Text style={{ color: '#888', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={sendEmail}>
                <Text style={{ color: '#0096FF', fontWeight: '600' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
