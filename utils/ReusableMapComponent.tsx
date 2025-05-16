import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';
import mapboxgl from 'mapbox-gl';
import { FeatureCollection } from 'geojson';

// Extend Window interface to include mapInstance
declare global {
    interface Window {
        mapInstance?: mapboxgl.Map;
    }
}

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
const { width, height } = Dimensions.get('window');

interface MapLocation {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
}

interface MapComponentProps {
    initialLocation?: {
        latitude?: number;
        longitude?: number;
        address?: string;
    };
    onLocationSelect?: (location: MapLocation) => void;
    showSearch?: boolean;
    height?: number | string;
    width?: number | string;
    zoomLevel?: number;
    showUserLocation?: boolean;
}

// Create a proper MapComponent with correct typing
const MapboxComponent = ({ children, ...props }: { children?: React.ReactNode;[key: string]: any }) => {
    if (Platform.OS === 'web') {
        return <div style={{ height: '100%', width: '100%' }} id="map" />;
    }

    return (
        <MapboxGL.MapView {...props}>
            {children}
        </MapboxGL.MapView>
    );
};

const ReusableMapComponent: React.FC<MapComponentProps> = ({
    initialLocation,
    onLocationSelect,
    showSearch = true,
    height: heightProp = height * 0.6,
    width: widthProp = '100%',
    zoomLevel = 14,
    showUserLocation = true,
}) => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<MapLocation[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mapInitialized, setMapInitialized] = useState<boolean>(false);
    const [centerCoordinates, setCenterCoordinates] = useState<[number, number] | null>(null);

    const [routeCoordinates, setRouteCoordinates] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
    
    // Reference to map instances
    const _camera = useRef<MapboxGL.Camera | null>(null);
    const mapRef = useRef<MapboxGL.MapView | null>(null);

    // Initialize map
    useEffect(() => {
        const initializeMapbox = async () => {
            try {
                setIsLoading(true);
                if (Platform.OS === 'web') {
                    mapboxgl.accessToken = mapboxToken;
                } else {
                    await MapboxGL.setAccessToken(mapboxToken);
                    if (Platform.OS === 'android') {
                        await MapboxGL.setConnected(true);
                    }
                }
                setMapInitialized(true);
            } catch (e) {
                console.error('Error initializing Mapbox:', e);
            } finally {
                setIsLoading(false);
            }
        };

        initializeMapbox();
    }, []);

    // Handle initial location setup
    useEffect(() => {
        const processInitialLocation = async () => {
            if (initialLocation) {
                let coords: [number, number] | null = null;

                if (initialLocation.latitude && initialLocation.longitude) {
                    coords = [initialLocation.longitude, initialLocation.latitude];
                } else if (initialLocation.address) {
                    const geocoded = await geocodeAddress(initialLocation.address);
                    if (geocoded) coords = geocoded;
                }

                if (coords) {
                    setDestinationCoords(coords);
                    setCenterCoordinates(coords);
                    setSelectedLocation({
                        name: 'Selected Location',
                        latitude: coords[1],
                        longitude: coords[0],
                        address: initialLocation.address
                    });
                }
            } else if (showUserLocation) {
                await requestUserLocation();
            }
        };

        processInitialLocation();
    }, [initialLocation, showUserLocation]);

    // Fetch route data whenever user location or destination changes
    useEffect(() => {
        const fetchRoute = async () => {
            if (!userLocation || !destinationCoords) return;

            console.log('Fetching route from', userLocation, 'to', destinationCoords);
            setIsLoading(true);
            
            try {
                const response = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${destinationCoords[0]},${destinationCoords[1]}?geometries=geojson&access_token=${mapboxToken}`
                );
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch route: ${response.status}`);
                }
                
                const data = await response.json();

                if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
                    console.log('Route data received:', data.routes[0].geometry);
                    
                    const routeFeature: GeoJSON.Feature<GeoJSON.LineString> = {
                        type: 'Feature',
                        properties: {},
                        geometry: data.routes[0].geometry
                    };
                    
                    setRouteCoordinates(routeFeature);
                } else {
                    console.warn('No route found in response:', data);
                }
            } catch (error) {
                console.error('Error fetching route:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userLocation && destinationCoords) {
            fetchRoute();
        }
    }, [userLocation, destinationCoords]);

    // Web-specific route handling
    useEffect(() => {
        if (Platform.OS !== 'web' || !window.mapInstance || !routeCoordinates) return;

        const map = window.mapInstance;

        // Clean up any existing layers/sources
        if (map.getLayer('route')) map.removeLayer('route');
        if (map.getSource('route')) map.removeSource('route');

        // Add new route
        map.addSource('route', {
            type: 'geojson',
            data: routeCoordinates
        });
        
        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3b9cff',
                'line-width': 4
            }
        });

        return () => {
            if (map.getLayer('route')) map.removeLayer('route');
            if (map.getSource('route')) map.removeSource('route');
        };
    }, [routeCoordinates]);

    // Initialize web map
    useEffect(() => {
        if (Platform.OS === 'web' && mapInitialized && mapboxToken) {
            const mapElement = document.getElementById('map');
            if (mapElement && !window.mapInstance) {
                const initialCenter = centerCoordinates || [0, 0];

                window.mapInstance = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: initialCenter,
                    zoom: zoomLevel
                });

                // Add user location control
                if (showUserLocation) {
                    window.mapInstance.addControl(new mapboxgl.GeolocateControl({
                        positionOptions: {
                            enableHighAccuracy: true
                        },
                        trackUserLocation: true
                    }));
                }

                // Wait for map to load before setting up event handlers
                window.mapInstance.on('load', () => {
                    console.log('Web map loaded');
                    
                    // Handle map clicks for web
                    window.mapInstance?.on('click', async (e) => {
                        const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
                        
                        try {
                            const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxToken}&limit=1`;
                            const response = await fetch(endpoint);
                            const data = await response.json();

                            let address = 'Unknown location';
                            let name = 'Selected Point';

                            if (data.features && data.features.length > 0) {
                                address = data.features[0].place_name;
                                name = data.features[0].text;
                            }

                            const newLocation: MapLocation = {
                                name,
                                latitude: coords[1],
                                longitude: coords[0],
                                address
                            };

                            setSelectedLocation(newLocation);
                            setCenterCoordinates(coords);
                            setDestinationCoords(coords);

                            if (onLocationSelect) {
                                onLocationSelect(newLocation);
                            }
                        } catch (error) {
                            console.error('Error handling map click:', error);
                        }
                    });
                });

                // Clean up on unmount
                return () => {
                    if (window.mapInstance) {
                        window.mapInstance.remove();
                        delete window.mapInstance;
                    }
                };
            }
        }
    }, [mapInitialized, centerCoordinates, zoomLevel, showSearch, showUserLocation]);

    // Update markers on web map
    useEffect(() => {
        if (Platform.OS === 'web' && window.mapInstance && centerCoordinates) {
            const map = window.mapInstance;
            
            // Update destination marker
            const existingMarker = document.getElementById('selected-location-marker');
            if (existingMarker) {
                existingMarker.remove();
            }

            // Create marker element
            const el = document.createElement('div');
            el.id = 'selected-location-marker';
            el.className = 'selected-location-marker';
            el.style.backgroundColor = '#E53935';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.border = '3px solid white';

            new mapboxgl.Marker(el)
                .setLngLat(centerCoordinates)
                .setPopup(new mapboxgl.Popup().setHTML(selectedLocation?.name || 'Selected Location'))
                .addTo(map);
                
            // Fit bounds to include both markers if both exist
            if (userLocation && destinationCoords) {
                const bounds = new mapboxgl.LngLatBounds()
                    .extend(userLocation)
                    .extend(destinationCoords);
                    
                map.fitBounds(bounds, {
                    padding: 100,
                    maxZoom: 15
                });
            } else {
                // Just zoom to the center coordinates
                map.flyTo({
                    center: centerCoordinates,
                    zoom: zoomLevel,
                    essential: true
                });
            }
        }
    }, [centerCoordinates, selectedLocation, zoomLevel]);

    // Update user location marker on web
    useEffect(() => {
        if (Platform.OS === 'web' && window.mapInstance && userLocation && showUserLocation) {
            const map = window.mapInstance;
            
            // Remove existing user marker if present
            const existingMarker = document.getElementById('user-location-marker');
            if (existingMarker) {
                existingMarker.remove();
            }

            // Add new user location marker
            const el = document.createElement('div');
            el.id = 'user-location-marker';
            el.className = 'user-location-marker';
            el.style.backgroundColor = '#2196F3';
            el.style.width = '15px';
            el.style.height = '15px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 0 0 4px rgba(33, 150, 243, 0.4)';

            new mapboxgl.Marker(el)
                .setLngLat(userLocation)
                .setPopup(new mapboxgl.Popup().setHTML('Your Location'))
                .addTo(map);
        }
    }, [userLocation, showUserLocation]);

    const requestUserLocation = async (): Promise<void> => {
        try {
            setIsLoading(true);
            let coords: [number, number];

            if (Platform.OS === 'web') {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 10000
                    });
                });

                coords = [position.coords.longitude, position.coords.latitude];
            } else {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('Permission to access location was denied');
                    return;
                }

                const location: LocationObject = await Location.getCurrentPositionAsync({});
                coords = [location.coords.longitude, location.coords.latitude];
            }

            console.log('Got user location:', coords);
            setUserLocation(coords);

            // If no initial location was provided, center on user location
            if (!centerCoordinates) {
                setCenterCoordinates(coords);
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
        try {
            const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1`;
            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.features?.[0]?.center) {
                return [data.features[0].center[0], data.features[0].center[1]];
            }
            return null;
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
    };

    const handleMapPress = async (event: any): Promise<void> => {
        // Handle native platform map press
        if (Platform.OS !== 'web') {
            const coords = event.geometry.coordinates;
            const longitude = coords[0];
            const latitude = coords[1];

            setIsLoading(true);
            try {
                // Reverse geocode to get address
                const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&limit=1`;
                const response = await fetch(endpoint);
                const data = await response.json();

                let address = 'Unknown location';
                let name = 'Selected Point';

                if (data.features && data.features.length > 0) {
                    address = data.features[0].place_name;
                    name = data.features[0].text;
                }

                const newLocation: MapLocation = {
                    name,
                    latitude,
                    longitude,
                    address
                };

                setSelectedLocation(newLocation);
                setCenterCoordinates([longitude, latitude]);
                setDestinationCoords([longitude, latitude]);

                if (onLocationSelect) {
                    onLocationSelect(newLocation);
                }
            } catch (error) {
                console.error('Error reverse geocoding:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSearch = async (): Promise<void> => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setIsLoading(true);

        try {
            // Mapbox Geocoding API for search
            const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&limit=5`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const results = data.features.map((feature: any) => ({
                    name: feature.text,
                    address: feature.place_name,
                    longitude: feature.center[0],
                    latitude: feature.center[1]
                }));

                setSearchResults(results);

                // Automatically select the first result
                const firstResult = results[0];
                setSelectedLocation(firstResult);
                setCenterCoordinates([firstResult.longitude, firstResult.latitude]);
                setDestinationCoords([firstResult.longitude, firstResult.latitude]);

                if (onLocationSelect) {
                    onLocationSelect(firstResult);
                }
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching locations:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const selectSearchResult = (location: MapLocation): void => {
        setSelectedLocation(location);
        setCenterCoordinates([location.longitude, location.latitude]);
        setDestinationCoords([location.longitude, location.latitude]);
        setSearchResults([]);
        setIsSearching(false);

        if (onLocationSelect) {
            onLocationSelect(location);
        }
    };

    const clearSearch = (): void => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
    };

    if (!mapInitialized || (isLoading && !centerCoordinates)) {
        return (
            <View style={[styles.container, { height: typeof heightProp === 'string' ? parseFloat(heightProp) : heightProp, width: typeof widthProp === 'string' ? parseFloat(widthProp) : widthProp }]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading map...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { height: typeof heightProp === 'string' ? parseFloat(heightProp) : heightProp, width: typeof widthProp === 'string' ? parseFloat(widthProp) : widthProp }]}>
            {showSearch && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a location"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    {searchQuery ? (
                        <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                            <Text style={styles.clearButtonText}>✕</Text>
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isSearching && searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                    {searchResults.map((result, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.searchResultItem}
                            onPress={() => selectSearchResult(result)}
                        >
                            <Text style={styles.searchResultName}>{result.name}</Text>
                            <Text style={styles.searchResultAddress}>{result.address}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.mapContainer}>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}

                <MapboxComponent
                    ref={mapRef}
                    style={styles.map}
                    styleURL={Platform.OS === 'web' ? undefined : MapboxGL.StyleURL.Street}
                    onPress={handleMapPress}
                    logoEnabled={false}
                    attributionEnabled={true}
                >
                    {Platform.OS !== 'web' && (
                        <>
                            <MapboxGL.Camera
                                ref={_camera}
                                centerCoordinate={centerCoordinates || [0, 0]}
                                zoomLevel={zoomLevel}
                                animationDuration={500}
                            />

                            {showUserLocation && (
                                <MapboxGL.UserLocation
                                    visible={true}
                                    onUpdate={(location) => {
                                        if (!userLocation) {
                                            const coords: [number, number] = [
                                                location.coords.longitude,
                                                location.coords.latitude
                                            ];
                                            setUserLocation(coords);

                                            // If no location is selected yet, center on user location
                                            if (!centerCoordinates) {
                                                setCenterCoordinates(coords);
                                            }
                                        }
                                    }}
                                />
                            )}

                            {/* Show destination marker */}
                            {centerCoordinates && (
                                <MapboxGL.PointAnnotation
                                    id="selectedLocation"
                                    coordinate={centerCoordinates}
                                    title={selectedLocation?.name || "Selected Location"}
                                >
                                    <View style={styles.markerContainer}>
                                        <View style={styles.marker} />
                                    </View>
                                </MapboxGL.PointAnnotation>
                            )}

                            {/* Show route path - note that this is outside the conditions now */}
                            {routeCoordinates && (
                                <MapboxGL.ShapeSource id="routeSource" shape={routeCoordinates}>
                                    <MapboxGL.LineLayer
                                        id="routeLine"
                                        style={{
                                            lineColor: '#3b9cff',
                                            lineWidth: 4,
                                            lineCap: 'round',
                                            lineJoin: 'round'
                                        }}
                                    />
                                </MapboxGL.ShapeSource>
                            )}
                        </>
                    )}
                </MapboxComponent>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    mapContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    clearButton: {
        padding: 5,
        marginLeft: 5,
    },
    clearButtonText: {
        fontSize: 16,
        color: '#666',
    },
    searchButton: {
        marginLeft: 5,
        padding: 8,
        backgroundColor: '#0066ff',
        borderRadius: 5,
    },
    searchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    searchResultsContainer: {
        position: 'absolute',
        top: 60,
        left: 10,
        right: 10,
        zIndex: 9,
        backgroundColor: 'white',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        maxHeight: 200,
        overflow: 'scroll',
    },
    searchResultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchResultName: {
        fontWeight: 'bold',
    },
    searchResultAddress: {
        fontSize: 12,
        color: '#666',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 8,
    },
    loadingText: {
        marginTop: 10,
        color: '#0066ff',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
    },
    marker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E53935',
        borderWidth: 3,
        borderColor: 'white',
    },
});

export default ReusableMapComponent;