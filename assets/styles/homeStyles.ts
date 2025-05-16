import { StyleSheet } from 'react-native';

const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        backgroundColor: '#0096FF',
        padding: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    locationTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    locationDesc: {
        color: '#fff',
        fontSize: 12,
    },
    trackTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    searchBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    input: {
        marginLeft: 10,
        flex: 1,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionItem: {
        alignItems: 'center',
        flex: 1,
    },
    actionLabel: {
        marginTop: 5,
        color: '#fff',
        fontSize: 12,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    cardSmall: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    cardTitle: {
        fontWeight: 'bold',
    },
    cardSubtitle: {
        color: '#777',
        marginTop: 5,
    },
    routeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    seeAllLink: {
        color: '#0096FF',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginTop: 10,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#888',
        marginTop: 5,
    },
    searchButton: {
        backgroundColor: '#0096FF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    loader: {
        marginVertical: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: '#e0f7fa',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#0277bd',
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadgeSmall: {
        marginBottom: 5,
    },
    statusTextSmall: {
        fontSize: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    carrierText: {
        fontSize: 12,
        color: '#666',
    },
    amountText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2e7d32',
    },
    cardSmallContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardSmallRight: {
        alignItems: 'flex-end',
    },
    cardSmallSubtitle: {
        fontSize: 12,
        color: '#777',
        marginTop: 2,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 13,
        color: '#555',
        marginLeft: 4,
    },
});

export default homeStyles;