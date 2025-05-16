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


type Errors = {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const styles = authStyles;
    const router = useRouter();

    const nameRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    const validate = () => {
        const newErrors: Errors = {};

        if (!name) {
            newErrors.name = 'Name is required';
        }

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        console.log('Starting signup process');
        if (!validate()) {
            console.log('Validation failed', errors);
            return;
        }

        setIsLoading(true);
        console.log('Attempting to create user with Supabase auth');

        try {
            // First create the user in Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error('Supabase Auth Error:', error);
                setIsLoading(false);
                Toast.show({
                    type: 'error',
                    text1: 'Signup Error',
                    text2: error.message || 'Failed to create account',
                });
                return;
            }

            console.log('Auth signup successful:', data);
            const user = data.user;

            if (user) {
                console.log('Inserting user data into users table');
                // Then insert the user into your custom users table
                const { error: dbError } = await supabase
                    .schema('public')
                    .from('users')
                    .insert({
                        id: user.id,
                        email: email,
                        name: name,
                        created_at: new Date(),
                    })
                    .select();

                console.log('Database insertion response:', dbError ? 'Error' : 'Success');


                if (dbError) {
                    console.error('Database Error:', dbError);
                    Toast.show({
                        type: 'error',
                        text1: 'Database Error',
                        text2: dbError.message || 'Failed to create user profile',
                    });
                } else {
                    console.log('User successfully added to users table');
                    Toast.show({
                        type: 'success',
                        text1: 'Signup Success',
                        text2: 'Please check your email to verify your account',
                    });

                    // Navigate to confirmation screen instead of login
                    router.replace('/login/verification');
                }
            } else {
                console.log('No user data returned from signup');
            }
        } catch (err) {
            console.error('Unexpected error during signup:', err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An unexpected error occurred',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        router.push('/login/login');
    };


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />

            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80' }}
                style={styles.backgroundImage}
            />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animatable.View animation="fadeInUp" duration={1000} style={styles.formContainer}>
                    <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                        <Toast position="top" />
                        <View style={styles.header}>
                            <Animatable.Text animation="fadeIn" delay={300} style={styles.title}>Create Account</Animatable.Text>
                            <Animatable.Text animation="fadeIn" delay={500} style={styles.subtitle}>Sign up to get started</Animatable.Text>
                        </View>

                        <Animatable.View animation="fadeInUp" delay={700} style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={22} color="#ccc" style={styles.inputIcon} />
                                <TextInput
                                    ref={nameRef}
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor="#8a8a8a"
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (errors.name) setErrors({ ...errors, name: '' });
                                    }}
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                />
                            </View>
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={22} color="#ccc" style={styles.inputIcon} />
                                <TextInput
                                    ref={emailRef}
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor="#8a8a8a"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) setErrors({ ...errors, email: '' });
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
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
                                        if (errors.password) setErrors({ ...errors, password: '' });
                                    }}
                                    secureTextEntry={!isPasswordVisible}
                                    returnKeyType="next"
                                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={22} color="#ccc" style={styles.inputIcon} />
                                <TextInput
                                    ref={confirmPasswordRef}
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#8a8a8a"
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                    }}
                                    secureTextEntry={!isPasswordVisible}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSignUp}
                                />
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleSignUp}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Sign Up</Text>
                                )}
                            </TouchableOpacity>
                        </Animatable.View>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Already have an account?</Text>
                            <TouchableOpacity onPress={handleLogin}>
                                <Text style={styles.signupButtonText}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Animatable.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}