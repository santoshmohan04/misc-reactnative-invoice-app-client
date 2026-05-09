import React, { useCallback, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text as TText } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useZodForm } from '../shared/forms/hooks/useZodForm';
import { TextInputField } from '../shared/forms/fields/TextInputField';
import { SelectField } from '../shared/forms/fields/SelectField';
import profileSchema, { type ProfileFormData } from '../shared/validation/profileSchema';
import InnerPageHeader from '../components/InnerPageHeader';
import Loader from '../components/Loader';
import { useUpdateUserMutation, useLogoutUserMutation } from '../store/apis/authApi';
import { useAuth } from '../store/hooks';
import { currencies } from '../utils/currencies.utils';
import type { RootStackParamList } from '../types';

const Profile: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const user = auth?.user;

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

  const onLogout = useCallback(async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutUser().unwrap();
            navigation.reset({ index: 0, routes: [{ name: 'login' }] });
          } catch (err) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  }, [logoutUser, navigation]);

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
          <SelectField
            control={control}
            name="base_currency"
            label="Base Currency"
            placeholder="Select currency"
            rules={{ required: 'Currency is required' }}
            options={currencies.map((c: any) => ({ label: `${c.name} (${c.symbol})`, value: c._id }))}
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
