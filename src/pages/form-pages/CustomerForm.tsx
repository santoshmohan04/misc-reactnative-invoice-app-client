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
  company: string;
  phone: string;
  mobile: string;
  address_1: string;
  address_2: string;
  address_3: string;
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
          style={FIELD_STYLE}
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
    defaultValues: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      company: customer?.company ?? '',
      phone: customer?.phone ?? '',
      mobile: customer?.mobile ?? '',
      address_1: customer?.addresses?.[0] ?? '',
      address_2: customer?.addresses?.[1] ?? '',
      address_3: customer?.addresses?.[2] ?? '',
    },
  });

  const onSubmit = async (values: CustomerFormValues): Promise<void> => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        company: values.company,
        phone: values.phone,
        mobile: values.mobile,
        addresses: [values.address_1, values.address_2, values.address_3].filter(Boolean),
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
            rules={{ required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } }}
            inputProps={{ placeholder: 'Customer Name', keyboardType: 'default' }}
          />
          <FormField
            label="Email"
            control={control}
            name="email"
            rules={{ pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } }}
            inputProps={{ placeholder: 'Email', keyboardType: 'email-address', autoCapitalize: 'none' }}
          />
          <FormField
            label="Company"
            control={control}
            name="company"
            inputProps={{ placeholder: 'Company', keyboardType: 'default' }}
          />
          <FormField
            label="Phone"
            control={control}
            name="phone"
            inputProps={{ placeholder: 'Phone', keyboardType: 'phone-pad' }}
          />
          <FormField
            label="Mobile"
            control={control}
            name="mobile"
            inputProps={{ placeholder: 'Mobile', keyboardType: 'phone-pad' }}
          />
        </View>
        <View style={styles.card}>
          <FormField
            label="Address Line 1"
            control={control}
            name="address_1"
            inputProps={{ placeholder: 'Address 1', keyboardType: 'default' }}
          />
          <FormField
            label="Address Line 2"
            control={control}
            name="address_2"
            inputProps={{ placeholder: 'Address 2', keyboardType: 'default' }}
          />
          <FormField
            label="Address Line 3"
            control={control}
            name="address_3"
            inputProps={{ placeholder: 'Address 3', keyboardType: 'default' }}
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
