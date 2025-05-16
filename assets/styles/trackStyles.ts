import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9f9f9',
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
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
    },
    searchContainer: {
      backgroundColor: '#fff',
      padding: 20,
      margin: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    searchTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#333',
      marginBottom: 8,
    },
    searchSubtitle: {
      fontSize: 14,
      color: '#777',
      marginBottom: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      height: 50,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      backgroundColor: '#fafafa',
    },
    trackButton: {
      backgroundColor: '#0096FF',
      height: 50,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginLeft: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    trackButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    recentContainer: {
      flex: 1,
      marginHorizontal: 16,
    },
    recentTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: '#333',
    },
    recentList: {
      paddingBottom: 20,
    },
    recentItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    recentInfo: {
      flex: 1,
    },
    recentTracking: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    recentDate: {
      fontSize: 14,
      color: '#777',
      marginTop: 4,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 14,
      color: '#0096FF',
      marginRight: 8,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: '#999',
      marginTop: 12,
    },
    helpContainer: {
      backgroundColor: '#fff',
      padding: 20,
      margin: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    helpTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 12,
    },
    helpButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    helpText: {
      fontSize: 14,
      color: '#0096FF',
      marginLeft: 8,
    },
  });

export default styles;