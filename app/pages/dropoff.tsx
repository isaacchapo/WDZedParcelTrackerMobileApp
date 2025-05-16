import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ScrollView
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';
import styles from '@/assets/styles/dropoffStyles';
import type { Feature, LineString, GeoJsonProperties } from 'geojson';
import Toast from 'react-native-toast-message';
import mapboxgl from 'mapbox-gl';

// Extend Window interface to include mapInstance
declare global {
    interface Window {
        mapInstance?: mapboxgl.Map;
    }
}

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';

const { width, height } = Dimensions.get('window');

interface LocationData {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    hours: string;
    phone: string;
}

type RouteShape = Feature<LineString, GeoJsonProperties>;

type CameraRef = MapboxGL.Camera | null;

// Create a proper MapComponent with correct typing
const MapComponent = ({ children, ...props }: { children?: React.ReactNode;[key: string]: any }) => {
    if (Platform.OS === 'web') {
        return <div style={{ height: '100%', width: '100%' }} id="map" />;
    }

    return (
        <MapboxGL.MapView {...props}>
            {children}
        </MapboxGL.MapView>
    );
};

export default function DropOffScreen() {
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [routeCoords, setRouteCoords] = useState<RouteShape | null>(null);

    const _camera = useRef<CameraRef>(null);
    const [locations] = useState<LocationData[]>([
        {
            id: 1,
            name: 'Bonita Drop Point',
            latitude: -15.4167,
            longitude: 28.2833,
            address: '123 Cairo Road, Lusaka',
            hours: 'Mon-Sat: 8AM-6PM, Sun: 10AM-4PM',
            phone: '+260 97 1234567'
        },
        {
            id: 2,
            name: 'City Mall Center',
            latitude: -15.4234,
            longitude: 28.3200,
            address: 'City Mall, Great East Road, Lusaka',
            hours: 'Mon-Sun: 9AM-8PM',
            phone: '+260 96 7654321'
        },
        {
            id: 3,
            name: 'Manda Hill Shipping',
            latitude: -15.4100,
            longitude: 28.3050,
            address: 'Manda Hill Mall, Great East Road',
            hours: 'Mon-Sat: 9AM-7PM, Sun: Closed',
            phone: '+260 95 5551234'
        },
        {
            id: 4,
            name: 'East Park Location',
            latitude: -15.4300,
            longitude: 28.3300,
            address: 'East Park Mall, Lusaka',
            hours: 'Mon-Sun: 8AM-9PM',
            phone: '+260 97 9876543'
        },
    ]);

    const requestUserLocation = async (): Promise<void> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permission denied',
                    text2: 'Location permission is required to use this feature.',
                });
                return;
            }

            const location: LocationObject = await Location.getCurrentPositionAsync({});
            const coords: [number, number] = [location.coords.longitude, location.coords.latitude];
            setUserLocation(coords);
        } catch (error) {
            console.error('Error fetching location:', error);
            Toast.show({
                type: 'error',
                text1: 'Location Error',
                text2: 'Unable to get your location.',
            });
        }
    };

    useEffect(() => {
        requestUserLocation();
    }, []);

    // Update user location marker on web when it changes
    useEffect(() => {
        if (Platform.OS === 'web' && window.mapInstance && userLocation) {
            // Remove existing user marker if present
            const existingMarker = document.getElementById('user-location-marker');
            if (existingMarker) {
                existingMarker.remove();
            }

            // Add new user location marker
            const el = document.createElement('div');
            el.id = 'user-location-marker';
            el.className = 'user-location-marker';
            el.style.backgroundColor = '#1E88E5';
            el.style.width = '15px';
            el.style.height = '15px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';

            new mapboxgl.Marker(el)
                .setLngLat(userLocation)
                .setPopup(new mapboxgl.Popup().setHTML('Your Location'))
                .addTo(window.mapInstance!);
        }
    }, [userLocation]);

    useEffect(() => {
        const initializeMapbox = async () => {
            try {
                if (Platform.OS === 'web') {
                    mapboxgl.accessToken = mapboxToken;
                } else {
                    await MapboxGL.setAccessToken(mapboxToken);
                    if (Platform.OS === 'android') {
                        await MapboxGL.setConnected(true);
                    }
                }
            } catch (e) {
                console.error('Error initializing Mapbox:', e);
            }
        };

        initializeMapbox();
    }, []);

    const center = {
        latitude: -15.4200,
        longitude: 28.3000,
    };

    useEffect(() => {
        if (Platform.OS === 'web') {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.longitude, position.coords.latitude]);
                },
                (error) => {
                    console.error('Web geolocation error:', error);
                }
            );

            // Only initialize the map if a mapbox token is available
            if (mapboxToken) {
                // Check if the map element exists
                const mapElement = document.getElementById('map');
                if (mapElement) {
                    // Store map instance in window for later access
                    window.mapInstance = new mapboxgl.Map({
                        container: 'map',
                        style: 'mapbox://styles/mapbox/streets-v11',
                        center: [center.longitude, center.latitude],
                        zoom: 13
                    });

                    locations.forEach(location => {
                        new mapboxgl.Marker()
                            .setLngLat([location.longitude, location.latitude])
                            .setPopup(new mapboxgl.Popup().setHTML(location.name))
                            .addTo(window.mapInstance!);
                    });

                    // Add user location marker when available
                    if (userLocation) {
                        new mapboxgl.Marker({ color: '#1E88E5' })
                            .setLngLat(userLocation)
                            .setPopup(new mapboxgl.Popup().setHTML('Your Location'))
                            .addTo(window.mapInstance);
                    }

                    return () => {
                        if (window.mapInstance) {
                            window.mapInstance.remove();
                            delete window.mapInstance;
                        }
                    };
                }
            }
        }
    }, [locations]);

    const handleMarkerPress = (location: LocationData): void => {
        setSelectedLocation(location);
        setExpandedCard(location.id);
    };

    const handleCardPress = (locationId: number): void => {
        if (expandedCard === locationId) {
            setExpandedCard(null);
        } else {
            setExpandedCard(locationId);
            const location = locations.find(loc => loc.id === locationId);
            if (location && _camera.current) {
                _camera.current.setCamera({
                    centerCoordinate: [location.longitude, location.latitude],
                    zoomLevel: 14,
                    animationDuration: 1000,
                });
            }
        }
    };

    const getRoute = async (destination: [number, number]): Promise<void> => {
        if (!userLocation) {
            Toast.show({
                type: 'error',
                text1: 'Location not available',
                text2: 'User location could not be determined.',
            });
            return;
        }

        // For debugging
        console.log('Getting route from', userLocation, 'to', destination);

        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${mapboxToken}`;

        try {
            const response = await fetch(directionsUrl);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Mapbox API Error:', errorText);
                throw new Error(`Mapbox API responded with status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.routes || data.routes.length === 0) {
                console.error('No routes returned from Mapbox API', data);
                Toast.show({
                    type: 'error',
                    text1: 'Route Error',
                    text2: 'No route found to this location.',
                });
                return;
            }

            const route = data.routes[0].geometry;
            console.log('Route received:', route);

            // Set route coordinates for display
            setRouteCoords({
                type: 'Feature',
                geometry: route,
                properties: {},
            });

            // Update camera to show the entire route
            if (Platform.OS !== 'web' && _camera.current) {
                setTimeout(() => {
                    try {
                        // Calculate bounds for the route
                        const sw = [
                            Math.min(userLocation[0], destination[0]) - 0.02,
                            Math.min(userLocation[1], destination[1]) - 0.02
                        ];
                        const ne = [
                            Math.max(userLocation[0], destination[0]) + 0.02,
                            Math.max(userLocation[1], destination[1]) + 0.02
                        ];

                        _camera.current?.fitBounds(
                            sw,
                            ne,
                            100, // padding
                            1000 // animation duration
                        );
                    } catch (e) {
                        console.error('Error adjusting camera:', e);
                    }
                }, 500);
            }

            // For web platform
            if (Platform.OS === 'web' && mapboxToken) {
                const mapElement = document.getElementById('map');
                if (mapElement && window.mapInstance) {
                    // Add route to map
                    if (window.mapInstance.getSource('route')) {
                        (window.mapInstance.getSource('route') as mapboxgl.GeoJSONSource).setData({
                            type: 'Feature',
                            geometry: route,
                            properties: {}
                        });
                    } else {
                        window.mapInstance.addSource('route', {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                geometry: route,
                                properties: {}
                            }
                        });

                        window.mapInstance.addLayer({
                            id: 'route',
                            type: 'line',
                            source: 'route',
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': '#007AFF',
                                'line-width': 4
                            }
                        });
                    }

                    // Fit map to show route
                    const coordinates = route.coordinates;
                    const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
                        return bounds.extend(coord);
                    }, new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));

                    window.mapInstance.fitBounds(bounds, {
                        padding: 50,
                        duration: 1000
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch directions", err);
            Toast.show({
                type: 'error',
                text1: 'Directions Error',
                text2: 'Unable to get directions to this location.',
            });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.heading}>Drop Off Locations</Text>
                    <Text style={styles.subHeading}>Find a convenient location near you</Text>
                </View>

                <View style={styles.mapContainer}>
                    <MapComponent
                        style={styles.map}
                        styleURL={Platform.OS === 'web' ? undefined : MapboxGL.StyleURL.Street}
                        logoEnabled={false}
                        attributionEnabled={false}
                    >
                        {Platform.OS !== 'web' && userLocation && (
                            <MapboxGL.PointAnnotation id="user-location" coordinate={userLocation}>
                                <View style={styles.userMarker}>
                                    <View style={styles.userMarkerDot} />
                                </View>
                            </MapboxGL.PointAnnotation>
                        )}

                        {Platform.OS !== 'web' && (
                            <>
                                <MapboxGL.UserLocation
                                    visible={true}
                                    onUpdate={(location) => {
                                        setUserLocation([
                                            location.coords.longitude,
                                            location.coords.latitude
                                        ]);
                                    }}
                                />
                                <MapboxGL.Camera
                                    ref={_camera}
                                    centerCoordinate={[center.longitude, center.latitude]}
                                    zoomLevel={13}
                                />
                                {locations.map((loc) => (
                                    <MapboxGL.PointAnnotation
                                        key={loc.id.toString()}
                                        id={loc.id.toString()}
                                        coordinate={[loc.longitude, loc.latitude]}
                                        onSelected={() => handleMarkerPress(loc)}
                                    >
                                        <View style={styles.markerContainer}>
                                            <View style={styles.markerDot} />
                                        </View>
                                    </MapboxGL.PointAnnotation>
                                ))}
                                {routeCoords && (
                                    <MapboxGL.ShapeSource id="routeSource" shape={routeCoords}>
                                        <MapboxGL.LineLayer
                                            id="routeLine"
                                            style={{
                                                lineColor: '#007AFF',
                                                lineWidth: 4,
                                                lineCap: 'round',
                                                lineJoin: 'round'
                                            }}
                                        />
                                    </MapboxGL.ShapeSource>
                                )}
                            </>
                        )}
                    </MapComponent>

                    {selectedLocation && (
                        <View style={styles.locationOverlay}>
                            <Text style={styles.locationName}>{selectedLocation.name}</Text>
                            <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.locationListContainer}>
                    <ScrollView
                        style={styles.locationList}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.locationListContent}
                    >
                        {locations.map((location) => (
                            <TouchableOpacity
                                key={location.id}
                                style={[
                                    styles.locationCard,
                                    expandedCard === location.id && styles.expandedCard
                                ]}
                                onPress={() => handleCardPress(location.id)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.locationCardHeader}>
                                    <View>
                                        <Text style={styles.locationCardName}>{location.name}</Text>
                                        <Text style={styles.locationCardAddress}>{location.address}</Text>
                                    </View>
                                    <View style={[
                                        styles.locationCardDot,
                                        expandedCard === location.id && styles.expandedCardDot
                                    ]} />
                                </View>

                                {expandedCard === location.id && (
                                    <View style={styles.expandedContent}>
                                        <View style={styles.divider} />
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Hours:</Text>
                                            <Text style={styles.infoValue}>{location.hours}</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Phone:</Text>
                                            <Text style={styles.infoValue}>{location.phone}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.directionsButton}
                                            onPress={() =>
                                                getRoute([location.longitude, location.latitude])
                                            }
                                        >
                                            <Text style={styles.directionsButtonText}>
                                                Get Directions
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}