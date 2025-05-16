import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type LocationRates = {
  [key: string]: number;
};

type RateData = {
  [key: string]: LocationRates;
};
// Mock data for rate calculation
const RATE_DATA: RateData = {
  // Format: [from_location][to_location] = rate per kg in ZMW
  'lusaka': {
    'ndola': 15,
    'kitwe': 18,
    'livingstone': 20,
    'chingola': 19,
    'chipata': 22
  },
  'ndola': {
    'lusaka': 15,
    'kitwe': 8,
    'livingstone': 25,
    'chingola': 7,
    'chipata': 30
  },
  'kitwe': {
    'lusaka': 18,
    'ndola': 8,
    'livingstone': 28,
    'chingola': 5,
    'chipata': 35
  }
};

// Base rate for locations not in our database
const BASE_RATE = 25;
// Fixed service fee
const SERVICE_FEE = 10;

interface RateResult {
  baseRate: number;
  weightCharge: number;
  serviceFee: number;
  totalCost: number;
}

export default function RatesScreen() {
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [calculating, setCalculating] = useState<boolean>(false);
  const [result, setResult] = useState<RateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const calculateRate = () => {
    setError(null);

    // Validate inputs
    if (!fromLocation.trim()) {
      setError('Please enter the origin location');
      return;
    }

    if (!toLocation.trim()) {
      setError('Please enter the destination location');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    // Start calculating animation
    setCalculating(true);
    setResult(null);
    Keyboard.dismiss();

    // Simulate API call with a delay
    setTimeout(() => {
      // Normalize location names for lookup
      const fromNormalized = fromLocation.trim().toLowerCase();
      const toNormalized = toLocation.trim().toLowerCase();

      // Get rate per kg (default to base rate if not found)
      let ratePerKg = BASE_RATE;

      if (RATE_DATA[fromNormalized] && RATE_DATA[fromNormalized][toNormalized]) {
        ratePerKg = RATE_DATA[fromNormalized][toNormalized];
      }

      // Calculate costs
      const baseRate = ratePerKg;
      const weightCharge = ratePerKg * weightNum;
      const serviceFee = SERVICE_FEE;
      const totalCost = weightCharge + serviceFee;

      setResult({
        baseRate,
        weightCharge,
        serviceFee,
        totalCost
      });

      setCalculating(false);
    }, 1000);
  };

  const resetForm = () => {
    setFromLocation('');
    setToLocation('');
    setWeight('');
    setResult(null);
    setError(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.heading}>Shipping Rate Calculator</Text>
          <Text style={styles.subHeading}>Calculate shipping costs instantly</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Available Shipping Locations</Text>
          <Text style={styles.infoText}>
            Our service currently covers shipping between major cities including Lusaka,
            Ndola, Kitwe, Livingstone, Chingola, and Chipata.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Origin</Text>
            <TextInput
              style={styles.input}
              placeholder="From Location (e.g., Lusaka)"
              value={fromLocation}
              onChangeText={setFromLocation}
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination</Text>
            <TextInput
              style={styles.input}
              placeholder="To Location (e.g., Ndola)"
              value={toLocation}
              onChangeText={setToLocation}
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parcel Weight</Text>
            <TextInput
              style={styles.input}
              placeholder="Weight in kg (e.g., 2.5)"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholderTextColor="#aaa"
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.calculateButton}
              onPress={calculateRate}
              disabled={calculating}
            >
              {calculating ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Calculate Rate</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetForm}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Shipping Cost Estimate</Text>
            </View>

            <View style={styles.resultContent}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Base Rate:</Text>
                <Text style={styles.resultValue}>ZMW {result.baseRate.toFixed(2)}/kg</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Weight Charge:</Text>
                <Text style={styles.resultValue}>ZMW {result.weightCharge.toFixed(2)}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Service Fee:</Text>
                <Text style={styles.resultValue}>ZMW {result.serviceFee.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Cost:</Text>
                <Text style={styles.totalValue}>ZMW {result.totalCost.toFixed(2)}</Text>
              </View>

              <Text style={styles.disclaimer}>
                * This is an estimate. Final cost may vary based on actual weight and dimensions.
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    marginRight: 16,
  },
  header: {
    marginBottom: 16,
    marginTop: 12,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  calculateButton: {
    backgroundColor: '#0096FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resetButtonText: {
    color: '#757575',
    fontWeight: '500',
    fontSize: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 12,
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    marginBottom: 16,
  },
  resultHeader: {
    backgroundColor: '#F5FAFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0096FF',
  },
  resultContent: {
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: '#757575',
  },
  resultValue: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0096FF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 8,
    fontStyle: 'italic',
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
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
});