// app/track/track/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '@/utils/supabaseClient';

export default function ParcelDetails() {
  const { id } = useLocalSearchParams();
  const [parcel, setParcel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchParcel = async () => {
      if (!id || typeof id !== 'string') return;

      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert('Error', 'Parcel not found.');
        router.replace('../app/(tabs)/track');
      } else {
        setParcel(data);
      }
      setLoading(false);
    };

    fetchParcel();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Tracking #{parcel.tracking_number}</Text>
      <Text>Status: {parcel.status}</Text>
      <Text>Location: {parcel.current_location}</Text>
      <Text>ETA: {new Date(parcel.eta).toLocaleString()}</Text>
    </View>
  );
}
