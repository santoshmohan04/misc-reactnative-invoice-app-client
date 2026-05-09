import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Text as TText } from 'tamagui';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import invoiceSchema, { type Invoice } from '../../types/schemas/invoice.schema';
import InvoiceItemRow from '@features/invoices/components/InvoiceItemRow';
import { calculateGrandTotal } from '@features/invoices/utils/calculations';
import { useUpsertInvoiceMutation, useGetCustomersQuery, useGetItemsQuery } from '@store/apis/dataApi';
import { useAppDispatch } from '@store/hooks';
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

const InvoiceForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const invoice = (route.params as any)?.invoice as Invoice | undefined;
  const draftKey = DRAFT_KEY(invoice?._id);

  const { data: customersData = [] } = useGetCustomersQuery();
  const { data: itemsData = [] } = useGetItemsQuery();

  const formatDate = (d: any) => {
    if (!d) return '';
    if (typeof d === 'string') return d.split('T')[0];
    return d instanceof Date ? d.toISOString().split('T')[0] : '';
  };

  const { control, handleSubmit, watch, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: useMemo(() => ({
      _id: invoice?._id,
      customer: invoice?.customer,
      number: invoice?.number ?? `INV${Date.now()}`,
      issued: invoice?.issued ? formatDate(invoice.issued) : formatDate(new Date()),
      due: invoice?.due ? formatDate(invoice.due) : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      notes: invoice?.notes ?? '',
      items: invoice?.items ?? [{ quantity: 0, price: 0, discount: 0 }],
    }), [invoice]),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const [upsertInvoice, { isLoading }] = useUpsertInvoiceMutation();

  // Autosave draft
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
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
  }, [draftKey, reset]);

  const computeTotals = useMemo(() => calculateGrandTotal(fields as any, 0), [fields]);

  const onSubmit = useCallback(async (values: FormValues) => {
    const payload = {
      ...values,
      issued: values.issued ? (typeof values.issued === 'string' ? values.issued : values.issued.toISOString()) : undefined,
      due: values.due ? (typeof values.due === 'string' ? values.due : values.due.toISOString()) : undefined,
    } as any;
    try {
      await upsertInvoice(payload).unwrap();
      await AsyncStorage.removeItem(draftKey);
      Alert.alert('Success', 'Invoice saved successfully');
      navigation.dispatch(CommonActions.goBack());
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Failed to save invoice');
    }
  }, [upsertInvoice, draftKey, navigation]);

  // dirty guard
  useEffect(() => {
    const beforeRemove = (e: any) => {
      if (!formState.isDirty) return;
      e.preventDefault();
      Alert.alert('Unsaved changes', 'You have unsaved changes. Discard them?', [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
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
              <TextInput
                style={FIELD_STYLE}
                value={typeof value === 'string' ? value : (value as any)?._id ?? ''}
                onChangeText={onChange}
                placeholder="Select or enter customer"
              />
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
            <InvoiceItemRow control={control} index={i} name="items" />
            <View style={styles.rowActions}>
              <Button size="$2" onPress={() => remove(i)}>
                <TText fontSize="$2">Remove</TText>
              </Button>
            </View>
          </View>
        ))}

        <Button onPress={() => append({ quantity: 0, price: 0, discount: 0 })}>
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
