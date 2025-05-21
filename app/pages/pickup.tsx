import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function PickupScreen() {
  const [address, setAddress] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  // const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [pickupId, setPickupId] = useState<string>('');
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Validate phone number format
  const isValidPhoneNumber = (phone: string): boolean => {
    // Basic validation for Zambian phone numbers
    const phoneRegex = /^(09|07)\d{8}$/;
    return phoneRegex.test(phone);
  };

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios'); // keep picker open on iOS
    setDate(currentDate);
  };

  // Handle pickup request submission
  const requestPickup = () => {
    setError(null);

    // Validate inputs
    if (!address.trim()) {
      setError('Please enter a pickup address');
      return;
    }

    if (!contactName.trim()) {
      setError('Please enter a contact name');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid Zambian phone number (e.g., 0977123456)');
      return;
    }

    // Simulate API request
    setLoading(true);

    // Simulate network request with timeout
    setTimeout(() => {
      setLoading(false);

      // Generate random pickup ID
      const randomId = 'PU' + Math.floor(100000 + Math.random() * 900000);
      setPickupId(randomId);

      // Show success modal
      setSuccessModal(true);
    }, 1500);
  };

  // Reset form after submission
  const resetForm = () => {
    setAddress('');
    setContactName('');
    setPhoneNumber('');
    setDate(new Date());
    setNotes('');
    setSuccessModal(false);
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color="#333" />
          </TouchableOpacity>
          <Text style={styles.heading}>Schedule a Pickup</Text>
          
        </View>
        <Text style={styles.subHeading}>We'll come to your location</Text>
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full address"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Person</Text>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              value={contactName}
              onChangeText={setContactName}
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 0977123456"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Date & Time</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
              <Text style={{ color: date ? 'black' : 'black' }}>
                {date ? date.toLocaleString() : 'Select date & time'}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                textColor={Platform.OS === 'ios' ? 'black' : undefined}
                onChange={onChange}
              />
            )}
            <Text style={styles.hint}>Note: Pickups available Monday-Saturday, 8 AM - 6 PM</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Special Instructions (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special instructions for our driver"
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={requestPickup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Request Pickup</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <View style={styles.stepContainer}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepText}>Submit your pickup request</Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepText}>Our team will confirm your appointment</Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepText}>Courier arrives at your location at the scheduled time</Text>
          </View>
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={successModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Pickup Scheduled!</Text>
            <Text style={styles.modalMessage}>
              Your pickup request has been submitted successfully. We'll confirm your appointment shortly.
            </Text>
            <Text style={styles.pickupId}>Pickup ID: {pickupId}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={resetForm}>
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    padding: 16,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subHeading: {
    fontSize: 26,
    padding: 10,
    color: '#757575',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
    // marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#0096FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 12,
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#F5FAFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0096FF',
    marginBottom: 12,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  stepText: {
    fontSize: 14,
    color: '#555555',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212121',
  },
  modalMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickupId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0096FF',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0096FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});