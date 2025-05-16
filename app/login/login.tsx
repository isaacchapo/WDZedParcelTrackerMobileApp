import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import authStyles from '@/assets/styles/authStyles';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabaseClient';
import Toast from 'react-native-toast-message';
import { useSession } from '../context/SessionContext';

const { width } = Dimensions.get('window');

type Errors = {
    email?: string;
    password?: string;
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const styles = authStyles;
    const router = useRouter();
    const { setSession } = useSession();


    const passwordRef = useRef<TextInput>(null);

    const validate = () => {
        const newErrors: Errors = {}; // Use the Errors type here

        // Email validation
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setIsLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setIsLoading(false);

        if (error) {
            Toast.show({
                type: 'error',
                text1: 'Login Error',
                text2: error.message || 'Login Failed',
            });
        } else if(data.session){
            setSession(data.session);
            Toast.show({
                type: 'Success',
                text1: 'Login Success',
                text2: 'You are now logged in!',
            });
            router.replace('/');
        }
    };


    const handleForgotPassword = () => {
        if (!email) {
            setErrors({ ...errors, email: 'Please enter your email first' });
            return;
        }
        Alert.alert(
            'Reset Password',
            `Password reset instructions will be sent to ${email}`,
            [{ text: 'OK' }]
        );
    };

    const handleSocialLogin = (platform: 'Facebook' | 'Twitter' | 'Google' | 'Apple') => {
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                'Social Login',
                `${platform} login initiated. This would connect to the ${platform} SDK in a real app.`,
                [{ text: 'OK' }]
            );
        }, 1000);
    };
    const handleSignUp = () => {
        router.push('/signup/signup');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />

            {/* Background Image */}
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80' }}
                style={styles.backgroundImage}
            />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animatable.View
                    animation="fadeInUp"
                    duration={1000}
                    style={styles.formContainer}
                >

                    <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                        <Toast position="top" />
                        <View style={styles.header}>
                            <Animatable.Text animation="fadeIn" delay={300} style={styles.title}>Welcome Back</Animatable.Text>
                            <Animatable.Text animation="fadeIn" delay={500} style={styles.subtitle}>Sign in to continue</Animatable.Text>
                        </View>

                        <Animatable.View animation="fadeInUp" delay={700} style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={22} color="#ccc" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor="#8a8a8a"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) {
                                            setErrors({ ...errors, email: "" });
                                        }
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                //   autoCompleteType="email"
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={22} color="#ccc" style={styles.inputIcon} />
                                <TextInput
                                    ref={passwordRef}
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#8a8a8a"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errors.password) {
                                            setErrors({ ...errors, password: '' });
                                        }
                                    }}
                                    secureTextEntry={!isPasswordVisible}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                //   autoCompleteType="password"
                                />
                                <TouchableOpacity
                                    style={styles.visibilityIcon}
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                >
                                    <Ionicons
                                        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                        size={22}
                                        color="#ccc"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={handleForgotPassword}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Log In</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.orContainer}>
                                <View style={styles.orLine} />
                                <Text style={styles.orText}>OR</Text>
                                <View style={styles.orLine} />
                            </View>

                            <View style={styles.socialContainer}>
                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#4267B2' }]}
                                    onPress={() => handleSocialLogin('Facebook')}
                                >
                                    <Ionicons name="logo-facebook" size={22} color="#ffffff" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
                                    onPress={() => handleSocialLogin('Twitter')}
                                >
                                    <Ionicons name="logo-twitter" size={22} color="#ffffff" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
                                    onPress={() => handleSocialLogin('Google')}
                                >
                                    <Ionicons name="logo-google" size={22} color="#ffffff" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#000000' }]}
                                    onPress={() => handleSocialLogin('Apple')}
                                >
                                    <Ionicons name="logo-apple" size={22} color="#ffffff" />
                                </TouchableOpacity>
                            </View>
                        </Animatable.View>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account?</Text>
                            <TouchableOpacity onPress={handleSignUp}>
                                <Text style={styles.signupButtonText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Animatable.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

