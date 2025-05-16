import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import Swiper from 'react-native-swiper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Onboarding() {
    const router = useRouter();

    return (
        <Swiper loop={false} showsButtons>
            <View style={styles.slide}>
                <Image source={require('../../assets/images/track.png')} style={styles.image} />
                <Text style={styles.text}>Track parcels in real-time</Text>
            </View>
            <View style={styles.slide}>
                <Image source={require('../../assets/images/history.png')} style={styles.image} />
                <Text style={styles.text}>View your tracking history</Text>
            </View>
            <View style={styles.slide}>
                <Image source={require('../../assets/images/report.png')} style={styles.image} />
                <Text style={styles.text}>Report delayed or missing parcels</Text>
                <Button
                    title="Get Started"
                    onPress={async () => {
                        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                        router.replace('/login/login');
                    }}
                />
            </View>
        </Swiper>
    );
}

const styles = StyleSheet.create({
    slide: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    text: { fontSize: 22, textAlign: 'center', marginTop: 20 },
    image: { width: 250, height: 250, resizeMode: 'contain' },
});
