import React, { useCallback, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, View, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Controller } from 'react-hook-form';
import { Button, Text as TText } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useZodForm } from '../shared/forms/hooks/useZodForm';
import { TextInputField } from '../shared/forms/fields/TextInputField';
import profileSchema, { type ProfileFormData } from '../shared/validation/profileSchema';
import InnerPageHeader from '../components/InnerPageHeader';
import Loader from '../components/Loader';
import { useUpdateUserMutation, useLogoutUserMutation } from '../store/apis/authApi';
import { useAppDispatch, useAuth } from '../store/hooks';
import { currencies } from '../utils/currencies.utils';
import type { RootStackParamList } from '../types';
import { authApi } from '../store/apis/authApi';

const Profile: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const user = auth?.user;
  const dispatch = useAppDispatch();

  const { control, handleSubmit, reset } = useZodForm({
    schema: profileSchema,
    defaultValues: {
      company: user?.company ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
      base_currency: user?.base_currency ?? 'USD',
    },
  });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [logoutUser] = useLogoutUserMutation();

  // Refetch user data when profile screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Invalidate the User tag to force refetch from server
      dispatch(authApi.util.invalidateTags(['User']));
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  // Update form when user data changes
  useEffect(() => {
    reset({
      company: user?.company ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
      base_currency: user?.base_currency ?? 'USD',
    });
  }, [user, reset]);

  const onSubmit = useCallback(
    async (values: ProfileFormData) => {
      try {
        await updateUser(values).unwrap();
        Alert.alert('Success', 'Profile successfully updated.');
      } catch (err: any) {
        Alert.alert('Error', err?.data?.message ?? 'Failed to update profile');
      }
    },
    [updateUser],
  );

  const onLogout = useCallback(() => {
    const performLogout = async () => {
      try {
        await logoutUser().unwrap();
      } catch (err) {
        // Local logout is already handled by authApi's onQueryStarted catch block.
        // We suppress the UI alert here so the user isn't trapped if the network is down.
        console.warn('Logout API error:', err);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ]);
    }
  }, [logoutUser]);

  return (
    <View style={styles.container}>
      {isUpdating && <Loader />}
      <InnerPageHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <TextInputField
            control={control}
            name="company"
            label="Company"
            placeholder="Company name"
            inputProps={{ keyboardType: 'default' }}
          />
          <TextInputField
            control={control}
            name="phone"
            label="Phone"
            placeholder="Phone number"
            rules={{ required: 'Phone is required' }}
            inputProps={{ keyboardType: 'phone-pad' }}
          />
          <TextInputField
            control={control}
            name="address"
            label="Address"
            placeholder="Street address"
            rules={{ required: 'Address is required' }}
          />
          <Controller
            control={control}
            name="base_currency"
            rules={{ required: 'Currency is required' }}
            render={({ field: { value, onChange } }) => (
              <View style={styles.selectWrapper}>
                <Text style={styles.selectLabel}>Base Currency</Text>
                <View style={styles.pickerWrap}>
                  <Picker
                    selectedValue={String(value ?? '')}
                    onValueChange={(currencyValue) => onChange(String(currencyValue ?? ''))}
                    style={styles.picker}
                  >
                    {currencies.map((c: any) => (
                      <Picker.Item key={String(c._id)} label={`${c.name} (${c.symbol})`} value={String(c._id)} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} style={styles.primaryButton}>
            <TText style={styles.buttonText}>Save Profile</TText>
          </Button>
        </View>

        <View style={styles.card}>
          <Button onPress={onLogout} style={styles.dangerButton}>
            <TText style={styles.buttonText}>Logout</TText>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 12,
    marginBottom: 12,
  },
  selectWrapper: { marginBottom: 12 },
  selectLabel: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: '500' },
  pickerWrap: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  picker: { minHeight: 40 },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default Profile;
