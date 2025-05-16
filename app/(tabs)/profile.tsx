import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabaseClient';
import { useSession } from '../context/SessionContext';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import profileStyles from '@/assets/styles/profileStyles';

interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  created_at: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Change password state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const styles = profileStyles;
  const router = useRouter();

  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      router.replace('/login/login');
    } else {
      fetchProfile(user.id);
    }
  }, [user]);


  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        Toast.show({
          type: 'error',
          text1: 'Profile Fetch Error',
          text2: 'Failed to fetch profile!',
        });
      } else if (data) {
        setProfile(data);
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'Error',
        text1: 'Error fetching profile',
        text2: 'Something went wrong fetching profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          fullName: fullName,
          phone,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error.message);

        Toast.show({
          type: 'error',
          text1: 'Update Error',
          text2: 'Failed to update profile',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Updated succefully',
          text2: 'Profile updated successfully',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update error',
        text2: 'An error occurred updating profile',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;

    Alert.alert('Confirm', 'Are you sure you want to delete your profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('users')
              .delete()
              .eq('id', user.id);

            if (error) {
              console.error('Delete error:', error.message);
              Toast.show({
                type: 'error',
                text1: 'Delete error',
                text2: 'An error occurred deleting profile',
              });
            } else {
              Toast.show({
                type: 'success',
                text1: 'Delete success',
                text2: 'Your profile has been removed',
              });
              handleLogout();
            }
          } catch (error) {

            Toast.show({
              type: 'error',
              text1: 'Delete error',
              text2: 'An error occurred deleting profile',
            });
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
        Toast.show({
          type: 'error',
          text1: 'Logout error',
          text2: 'Failed to logout',
        });
      } else {
        router.replace('/login/login');
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Logout error',
        text2: 'An error occurred during logout',
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleChangePassword = async () => {
    // Input validation
    if (!newPassword || !confirmPassword || !currentPassword) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all password fields',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'New passwords do not match',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Password error',
        text2: 'Password must be at least 6 characters',
      });
      return;
    }

    setChangingPassword(true);
    try {
      // First verify the user's credentials with the current password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        Toast.show({
          type: 'error',
          text1: 'password error',
          text2: 'Current password is incorrect',
        });
        setChangingPassword(false);
        return;
      }

      // Then update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password change error:', error.message);
        Toast.show({
          type: 'error',
          text1: 'password error',
          text2: error.message,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Password changed',
          text2: 'Password changed successfully',
        });
        // Reset fields and close modal
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordModalVisible(false);
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Password error',
        text2: 'An error occurred changing password',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0096FF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Toast position='bottom' />
      {user?.email && (
        <View style={styles.emailContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>
      )}

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter full name"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdateProfile}
        disabled={updating}
      >
        {updating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Profile</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.passwordButton}
        onPress={() => setPasswordModalVisible(true)}
      >
        <Ionicons name="lock-closed-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteProfile}
      >
        <Ionicons name="trash-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Delete Profile</Text>
      </TouchableOpacity>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              secureTextEntry
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}