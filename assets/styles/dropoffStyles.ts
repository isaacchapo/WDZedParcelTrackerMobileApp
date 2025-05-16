import {
    Dimensions,
    StyleSheet,
    Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 16 : 0,
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
    mapContainer: {
        height: height * 0.4,
        width: width,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        position: 'relative',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
    },
    markerDot: {
        width: 20,
        height: 20,
        backgroundColor: '#0096FF',
        borderRadius: 10,
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    selectedMarkerContainer: {
        zIndex: 10,
    },
    userMarker: {
        width: 30,
        height: 30,
        backgroundColor: '#007AFF55',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userMarkerDot: {
        width: 10,
        height: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
    },

    selectedMarkerDot: {
        backgroundColor: '#FF6B00',
        transform: [{ scale: 1.2 }],
    },
    locationOverlay: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    locationName: {
        fontWeight: '600',
        fontSize: 16,
        color: '#0096FF',
    },
    locationAddress: {
        fontSize: 14,
        color: '#757575',
        marginTop: 4,
    },
    locationListContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    locationList: {
        flex: 1,
    },
    locationListContent: {
        paddingBottom: 20,
    },
    locationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2.22,
        elevation: 2,
        borderWidth: Platform.OS === 'ios' ? 0 : 0,
        borderColor: '#E0E0E0',
    },
    expandedCard: {
        borderColor: '#0096FF',
        borderWidth: Platform.OS === 'ios' ? 0 : 1,
        shadowColor: '#0096FF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 6,
        elevation: 5,
    },
    locationCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationCardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    locationCardAddress: {
        fontSize: 14,
        color: '#757575',
    },
    locationCardDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0096FF',
    },
    expandedCardDot: {
        backgroundColor: '#FF6B00',
    },
    expandedContent: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        width: 60,
        fontSize: 14,
        fontWeight: '500',
        color: '#757575',
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        color: '#212121',
    },
    directionsButton: {
        backgroundColor: '#0096FF',
        borderRadius: 6,
        padding: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    directionsButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default styles;