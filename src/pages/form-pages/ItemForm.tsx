import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Text as TText } from 'tamagui';
import { useForm, Controller, type Control, type RegisterOptions, type FieldPath } from 'react-hook-form';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Loader from '../../components/Loader';
import InnerPageHeader from '../../components/InnerPageHeader';
import { getCurrency } from '../../utils/currencies.utils';
import { useUpsertItemMutation } from '../../store/apis/dataApi';
import { useAuthUser } from '../../store/hooks';
import type { Item, RootStackParamList } from '../../types';

type ItemFormValues = {
  name: string;
  price: string;
  description: string;
};

type FormFieldProps = {
  label: string;
  control: Control<ItemFormValues>;
  name: FieldPath<ItemFormValues>;
  rules?: RegisterOptions<ItemFormValues, FieldPath<ItemFormValues>>;
  inputProps?: React.ComponentProps<typeof TextInput>;
};

type ItemRoute = RouteProp<RootStackParamList, 'itemForm'>;
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
          style={[FIELD_STYLE, inputProps?.multiline && { minHeight: 80, paddingTop: 10, textAlignVertical: 'top' }]}
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

const ItemForm: React.FC = () => {
  const navigation = useNavigation<RootNav>();
  const route = useRoute<ItemRoute>();
  const item = route.params?.item as Item | null | undefined;
  const user = useAuthUser();
  const currency = getCurrency(user?.base_currency);

  const [upsertItem, { isLoading }] = useUpsertItemMutation();

  const { control, handleSubmit } = useForm<ItemFormValues>({
    defaultValues: {
      name: item?.name ?? '',
      price: item?.price != null ? String(item.price) : '',
      description: item?.description ?? '',
    },
  });

  const onSubmit = async (values: ItemFormValues): Promise<void> => {
    const price = parseFloat(values.price);
    if (Number.isNaN(price) || price <= 0) {
      return;
    }

    try {
      const payload = {
        name: values.name,
        price,
        description: values.description,
        ...(item?._id && { _id: item._id }),
      };
      await upsertItem(payload).unwrap();
      Alert.alert('Success', 'Item successfully saved.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Failed to save item.');
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <Loader />}
      <InnerPageHeader title="Item" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <FormField
            label="Item Name *"
            control={control}
            name="name"
            rules={{ required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } }}
            inputProps={{ placeholder: 'Item Name', keyboardType: 'default' }}
          />
          <FormField
            label={`Unit Price (${currency ?? '$'}) *`}
            control={control}
            name="price"
            rules={{
              required: 'Price is required',
              validate: (value: string) => (!Number.isNaN(parseFloat(value)) && parseFloat(value) > 0) || 'Must be a positive number',
            }}
            inputProps={{ placeholder: '0.00', keyboardType: 'decimal-pad' }}
          />
          <FormField
            label="Description"
            control={control}
            name="description"
            inputProps={{ placeholder: 'Description', multiline: true, numberOfLines: 3 }}
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

export default ItemForm;
