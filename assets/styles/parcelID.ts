import { StyleSheet } from 'react-native';

const ACCENT = '#0096FF';
const LIGHT_GRAY = '#f4f4f4';
const TEXT_PRIMARY = '#1e1e1e';
const TEXT_SECONDARY = '#555';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
    paddingHorizontal: 16,
  },
  trackingNumber: {
    fontWeight: 'bold',
    fontSize: 18,  // Optional: make it slightly larger
    color: '#333', // Optional: darker color for emphasis
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LIGHT_GRAY,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: LIGHT_GRAY,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: 'red',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: TEXT_PRIMARY,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: TEXT_PRIMARY,
  },
  detailText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    marginBottom: 6,
  },
  updateItem: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    paddingLeft: 12,
    marginBottom: 16,
  },
  updateStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ACCENT,
  },
  updateLocation: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  updateNote: {
    fontStyle: 'italic',
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  updateTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});

export default styles;
