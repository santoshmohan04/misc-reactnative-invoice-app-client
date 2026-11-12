import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Text as TText } from 'tamagui';
import { useForm, Controller, type Control, type RegisterOptions, type FieldPath } from 'react-hook-form';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Loader from '../../components/Loader';
import InnerPageHeader from '../../components/InnerPageHeader';
import { useUpsertCustomerMutation } from '../../store/apis/dataApi';
import type { Customer, RootStackParamList } from '../../types';

type CustomerFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type FormFieldProps = {
  label: string;
  control: Control<CustomerFormValues>;
  name: FieldPath<CustomerFormValues>;
  rules?: RegisterOptions<CustomerFormValues, FieldPath<CustomerFormValues>>;
  inputProps?: React.ComponentProps<typeof TextInput>;
};

type CustomerRoute = RouteProp<RootStackParamList, 'customerForm'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

const FIELD_STYLE = {
  minHeight: 42,
  borderWidth: 1,
  borderColor: 'rgba(15,23,42,0.18)',
  borderRadius: 8,
  backgroundColor: '#ffffff',
  paddingHorizontal: 10,
  fontSize: 14,
  color: '#0f172a',
} as const;

const FormField: React.FC<FormFieldProps> = ({ label, control, name, rules, inputProps }) => (
  <Controller
    control={control}
    name={name}
    rules={rules}
    render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
      <View style={styles.fieldWrap}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          style={[
            FIELD_STYLE,
            inputProps?.multiline && { minHeight: 80, paddingTop: 10, textAlignVertical: 'top' },
            error && { borderColor: '#f32013' },
          ]}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholderTextColor="#94a3b8"
          {...inputProps}
        />
        {error ? <Text style={styles.error}>{error.message}</Text> : null}
      </View>
    )}
  />
);

const CustomerForm: React.FC = () => {
  const navigation = useNavigation<RootNav>();
  const route = useRoute<CustomerRoute>();
  const customer = route.params?.customer as Customer | null | undefined;

  const [upsertCustomer, { isLoading }] = useUpsertCustomerMutation();

  const { control, handleSubmit } = useForm<CustomerFormValues>({
    mode: 'onTouched',
    defaultValues: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      address: customer?.address ?? customer?.addresses?.filter(Boolean).join(', ') ?? '',
    },
  });

  const onSubmit = async (values: CustomerFormValues): Promise<void> => {
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        ...(customer?._id && { _id: customer._id }),
      };
      await upsertCustomer(payload).unwrap();
      Alert.alert('Success', 'Customer successfully saved.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Failed to save customer.');
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <Loader />}
      <InnerPageHeader title="Customer" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <FormField
            label="Customer Name *"
            control={control}
            name="name"
            rules={{
              validate: (value: string) => {
                const len = value.trim().length;
                if (len < 1) return 'Customer name is required';
                if (len < 2) return 'Customer name must be at least 2 characters';
                if (len > 100) return 'Customer name cannot exceed 100 characters';
                return true;
              },
            }}
            inputProps={{ placeholder: 'Customer Name', keyboardType: 'default' }}
          />
          <FormField
            label="Email *"
            control={control}
            name="email"
            rules={{
              validate: (value: string) => {
                const v = value.trim();
                if (!v) return 'Email is required';
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please provide a valid email address';
              },
            }}
            inputProps={{ placeholder: 'Email', keyboardType: 'email-address', autoCapitalize: 'none' }}
          />
          <FormField
            label="Phone *"
            control={control}
            name="phone"
            rules={{
              validate: (value: string) => {
                const len = value.trim().length;
                if (len < 1) return 'Phone number is required';
                if (len < 8) return 'Phone number must be at least 8 characters';
                if (len > 20) return 'Phone number cannot exceed 20 characters';
                return true;
              },
            }}
            inputProps={{ placeholder: 'Phone', keyboardType: 'phone-pad' }}
          />
        </View>
        <View style={styles.card}>
          <FormField
            label="Address *"
            control={control}
            name="address"
            rules={{
              validate: (value: string) => {
                const len = value.trim().length;
                if (len < 1) return 'Address is required';
                if (len < 10) return 'Address must be at least 10 characters';
                if (len > 500) return 'Address cannot exceed 500 characters';
                return true;
              },
            }}
            inputProps={{ placeholder: 'Address', keyboardType: 'default', multiline: true, numberOfLines: 3 }}
          />
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
      <View style={styles.footer}>
        <Button style={styles.saveButton} onPress={handleSubmit(onSubmit)}>
          <TText style={styles.saveButtonText}>Save</TText>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    padding: 10,
  },
  fieldWrap: { marginBottom: 8 },
  label: { marginBottom: 4, color: '#475569', fontSize: 13 },
  error: { color: '#f32013', fontSize: 12, marginTop: 2 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: '#ffffff', fontWeight: '700' },
  bottomSpacer: { height: 8 },
});

export default CustomerForm;
