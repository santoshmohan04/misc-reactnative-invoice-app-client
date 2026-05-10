import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button, Text as TText } from 'tamagui';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import invoiceSchema, { type Invoice } from '../../types/schemas/invoice.schema';
import InvoiceItemRow from '@features/invoices/components/InvoiceItemRow';
import { calculateGrandTotal } from '@features/invoices/utils/calculations';
import { useUpsertInvoiceMutation, useGetCustomersQuery, useGetItemsQuery } from '@store/apis/dataApi';
import Loader from '@components/Loader';
import InnerPageHeader from '@components/InnerPageHeader';

const DRAFT_KEY = (id?: string) => `invoice_draft:${id ?? 'new'}`;
const FIELD_STYLE = {
  minHeight: 40,
  borderWidth: 1,
  borderColor: 'rgba(15,23,42,0.12)',
  borderRadius: 6,
  backgroundColor: '#fff',
  paddingHorizontal: 8,
  fontSize: 14,
  color: '#0f172a',
};

type FormValues = Invoice & { issued?: string | Date; due?: string | Date };
const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

const InvoiceForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = (route.params as any) ?? {};
  const invoice = routeParams.invoice as Invoice | undefined;
  const newNumber = routeParams.newNumber as string | undefined;
  const isEditMode = Boolean(invoice?._id);
  const draftKey = DRAFT_KEY(invoice?._id);

  const { data: customersData = [] } = useGetCustomersQuery();
  const { data: itemsData = [] } = useGetItemsQuery();

  const formatDate = (d: any) => {
    if (!d) return '';
    if (typeof d === 'string') return d.split('T')[0];
    return d instanceof Date ? d.toISOString().split('T')[0] : '';
  };

  const initialValues = useMemo<FormValues>(() => ({
    _id: invoice?._id,
    customer: typeof invoice?.customer === 'string' ? invoice.customer : (invoice?.customer as { _id?: string } | undefined)?._id,
    number: invoice?.number ?? newNumber ?? `INV${Date.now()}`,
    issued: invoice?.issued ? formatDate(invoice.issued) : formatDate(new Date()),
    due: invoice?.due ? formatDate(invoice.due) : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    notes: invoice?.notes ?? '',
    items:
      invoice?.items?.map((it) => ({
        ...it,
        item:
          typeof it.item === 'string'
            ? it.item
            : (it.item as { _id?: string; id?: string } | undefined)?._id ??
              (it.item as { _id?: string; id?: string } | undefined)?.id,
        quantity: Number(it.quantity ?? 0),
        price: Number(it.price ?? (it.subtotal ?? 0)),
        discount: Number(it.discount ?? 0),
      })) ?? [{ item: '', quantity: 1, price: 0, discount: 0 }],
  }), [invoice, newNumber]);

  const { control, handleSubmit, watch, reset, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const [upsertInvoice, { isLoading }] = useUpsertInvoiceMutation();

  const customerOptions = useMemo(
    () =>
      customersData
        .map((customer: any) => ({
          value: String(customer?._id ?? customer?.id ?? ''),
          label: customer?.name ? `${customer.name}` : String(customer?._id ?? customer?.id ?? ''),
        }))
        .filter((c) => OBJECT_ID_REGEX.test(c.value)),
    [customersData],
  );

  const itemOptions = useMemo(
    () =>
      itemsData
        .map((item: any) => ({
          value: String(item?._id ?? item?.id ?? ''),
          label: item?.name ? `${item.name}` : String(item?._id ?? item?.id ?? ''),
          price: Number(item?.unit_price ?? item?.price ?? 0),
        }))
        .filter((i) => OBJECT_ID_REGEX.test(i.value)),
    [itemsData],
  );

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  // Autosave draft
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allowExitRef = useRef(false);
  const watchAll = watch();
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(draftKey, JSON.stringify(watchAll));
      } catch (e) {
        // ignore
      }
    }, 800);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [watchAll, draftKey]);

  // restore draft
  useEffect(() => {
    if (!isEditMode) {
      AsyncStorage.removeItem(draftKey).catch(() => {
        // ignore
      });
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(draftKey);
        if (raw && mounted) {
          const parsed = JSON.parse(raw);
          reset(parsed);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [draftKey, isEditMode, reset]);

  const watchedItems = useWatch({ control, name: 'items' }) ?? [];
  const computeTotals = useMemo(() => calculateGrandTotal(watchedItems as any, 0), [watchedItems]);

  const normalizeDate = (value?: string | Date) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value.split('T')[0];
    return value.toISOString().split('T')[0];
  };

  const getCustomerId = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && '_id' in (value as any)) {
      return String((value as any)._id ?? '');
    }
    if (value && typeof value === 'object' && 'id' in (value as any)) {
      return String((value as any).id ?? '');
    }
    return '';
  };

  const getItemId = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && '_id' in (value as any)) {
      return String((value as any)._id ?? '');
    }
    if (value && typeof value === 'object' && 'id' in (value as any)) {
      return String((value as any).id ?? '');
    }
    return '';
  };

  const handleSelectItem = useCallback(
    (index: number, itemId: string) => {
      const selected = itemOptions.find((it) => it.value === itemId);
      const currentQuantity = Number((watch('items') ?? [])[index]?.quantity ?? 1);
      const price = Number(selected?.price ?? 0);
      setValue(`items.${index}.item` as const, itemId as any, { shouldDirty: true });
      setValue(`items.${index}.quantity` as const, currentQuantity as any, { shouldDirty: true });
      setValue(`items.${index}.price` as const, price as any, { shouldDirty: true });
    },
    [itemOptions, setValue, watch],
  );

  const onSubmit = useCallback(async (values: FormValues) => {
    const customerId = getCustomerId(values.customer);
    if (!OBJECT_ID_REGEX.test(customerId)) {
      Alert.alert('Validation', 'Please select a valid customer.');
      return;
    }

    const normalizedItems = (values.items ?? [])
      .map((it) => {
        const itemId = getItemId(it.item);
        const quantity = Number(it.quantity ?? 0);
        const price = Number(it.price ?? 0);
        return {
          item: itemId,
          quantity,
          subtotal: Number((quantity * price).toFixed(2)),
        };
      })
      .filter((it) => OBJECT_ID_REGEX.test(it.item) && it.quantity > 0);

    if (normalizedItems.length === 0) {
      Alert.alert('Validation', 'Please add at least one valid item.');
      return;
    }

    const payload: any = {
      number: values.number,
      customer: customerId,
      issued: normalizeDate(values.issued),
      due: normalizeDate(values.due),
      items: normalizedItems,
      subtotal: Number(computeTotals.subtotal.toFixed(2)),
      discount: Number(computeTotals.discount.toFixed(2)),
      total: Number(computeTotals.total.toFixed(2)),
      payment: null,
    };

    if (values._id) {
      payload._id = values._id;
    }

    try {
      await upsertInvoice(payload).unwrap();
      await AsyncStorage.removeItem(draftKey);
      // Bypass dirty-state guard after a successful save.
      allowExitRef.current = true;
      reset(values);
      Alert.alert('Success', 'Invoice saved successfully');
      navigation.dispatch(CommonActions.goBack());
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Failed to save invoice');
    }
  }, [computeTotals.discount, computeTotals.subtotal, computeTotals.total, draftKey, navigation, upsertInvoice]);

  // dirty guard
  useEffect(() => {
    const beforeRemove = (e: any) => {
      if (allowExitRef.current) return;
      if (!formState.isDirty) return;
      e.preventDefault();

      if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
        const shouldDiscard = globalThis.confirm('You have unsaved changes. Discard them?');
        if (shouldDiscard) {
          allowExitRef.current = true;
          navigation.dispatch(e.data.action);
        }
        return;
      }

      Alert.alert('Unsaved changes', 'You have unsaved changes. Discard them?', [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            allowExitRef.current = true;
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    };
    const unsubscribe = (navigation as any).addListener('beforeRemove', beforeRemove);
    return unsubscribe;
  }, [formState.isDirty, navigation]);

  return (
    <View style={styles.container}>
      {isLoading && <Loader />}
      <InnerPageHeader title="Invoice" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.label}>Invoice Number</Text>
          <Controller
            control={control}
            name="number"
            render={({ field: { onChange, value } }) => (
              <TextInput style={FIELD_STYLE} value={value} onChangeText={onChange} placeholder="INV001" />
            )}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Customer</Text>
          <Controller
            control={control}
            name="customer"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={typeof value === 'string' ? value : ''}
                  onValueChange={(selectedValue) => onChange(String(selectedValue ?? ''))}
                  style={styles.picker}
                >
                  <Picker.Item label="Select customer" value="" />
                  {customerOptions.map((opt) => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
            )}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Issued Date</Text>
          <Controller
            control={control}
            name="issued"
            render={({ field: { onChange, value } }) => (
              <TextInput style={FIELD_STYLE} value={String(value ?? '')} onChangeText={onChange} placeholder="YYYY-MM-DD" />
            )}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Due Date</Text>
          <Controller
            control={control}
            name="due"
            render={({ field: { onChange, value } }) => (
              <TextInput style={FIELD_STYLE} value={String(value ?? '')} onChangeText={onChange} placeholder="YYYY-MM-DD" />
            )}
          />
        </View>

        <Text style={styles.sectionLabel}>Items</Text>
        {fields.map((f, i) => (
          <View key={f.id} style={styles.itemRowWrap}>
            <InvoiceItemRow control={control} index={i} name="items" itemOptions={itemOptions} onSelectItem={handleSelectItem} />
            <View style={styles.rowActions}>
              <Button size="$2" onPress={() => remove(i)}>
                <TText fontSize="$2">Remove</TText>
              </Button>
            </View>
          </View>
        ))}

        <Button onPress={() => append({ item: '', quantity: 1, price: 0, discount: 0 })}>
          <TText>+ Add Item</TText>
        </Button>

        <View style={styles.totals}>
          <Text style={styles.totalLine}>Subtotal: ${computeTotals.subtotal.toFixed(2)}</Text>
          <Text style={styles.totalLine}>Discount: ${computeTotals.discount.toFixed(2)}</Text>
          <Text style={styles.totalLine}>Tax: ${computeTotals.tax.toFixed(2)}</Text>
          <Text style={[styles.totalLine, { fontWeight: '700', fontSize: 16 }]}>Total: ${computeTotals.total.toFixed(2)}</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={handleSubmit(onSubmit)} style={styles.saveButton}>
          <TText style={styles.saveButtonText}>Save Invoice</TText>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 10, paddingTop: 10 },
  card: { backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  label: { fontSize: 13, color: '#475569', marginBottom: 6 },
  pickerWrap: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  picker: { minHeight: 40 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginVertical: 10, color: '#1e293b' },
  itemRowWrap: { marginBottom: 12, backgroundColor: '#fff', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  rowActions: { marginTop: 8, alignItems: 'flex-end' },
  totals: { marginTop: 16, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6 },
  totalLine: { fontSize: 13, marginBottom: 4, color: '#475569' },
  footer: { padding: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', backgroundColor: '#fff' },
  saveButton: { width: '100%', backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '700' },
});

export default InvoiceForm;
