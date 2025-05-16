import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import authStyles from '@/assets/styles/authStyles';
import { useRouter } from 'expo-router';

export default function EmailVerification() {
    const styles = authStyles;
    const router = useRouter();

    const handleGoToLogin = () => {
        router.replace('/login/login');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80' }}
                style={styles.backgroundImage}
            />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animatable.View animation="fadeInUp" duration={1000} style={styles.formContainer}>
                    <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                        <View style={styles.header}>
                            <Animatable.Text animation="fadeIn" delay={300} style={styles.title}>Check Your Email</Animatable.Text>
                            <Ionicons 
                                name="mail" 
                                size={80} 
                                color="#4CAF50" 
                                style={{marginVertical: 20}} 
                            />
                            <Animatable.Text animation="fadeIn" delay={500} style={styles.subtitle}>
                                We've sent you a verification email. Please check your inbox and follow the link to verify your account.
                            </Animatable.Text>
                        </View>

                        <Animatable.View animation="fadeInUp" delay={700} style={[styles.form, {alignItems: 'center'}]}>
                            <Text style={{color: '#ccc', marginBottom: 20, textAlign: 'center'}}>
                                If you don't see the email, check your spam folder or request a new verification link.
                            </Text>

                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleGoToLogin}
                            >
                                <Text style={styles.loginButtonText}>Go to Login</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    </BlurView>
                </Animatable.View>
            </ScrollView>
        </View>
    );
}