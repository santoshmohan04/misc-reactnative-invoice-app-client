import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Text as TText } from 'tamagui';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import invoiceSchema, { Invoice } from '../../types/schemas/invoice.schema';
import InvoiceItemRow from '../../features/invoices/components/InvoiceItemRow';
import { calculateGrandTotal } from '../../features/invoices/utils/calculations';
import { useUpsertInvoiceMutation } from '../../store/apis/dataApi';
import { useAppDispatch } from '../../store/hooks';
import Loader from '../../components/Loader';
import InnerPageHeader from '../../components/InnerPageHeader';

const DRAFT_KEY = (id?: string) => `invoice_draft:${id ?? 'new'}`;

type FormValues = Invoice;

const InvoiceForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const invoice = (route.params as any)?.invoice as Invoice | undefined;
  const draftKey = DRAFT_KEY(invoice?._id);

  const { control, handleSubmit, watch, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: useMemo(() => ({
      _id: invoice?._id,
      customer: invoice?.customer ?? { _id: '' },
      invoice_number: invoice?.invoice_number ?? '',
      issued_date: invoice?.issued_date ?? new Date().toISOString(),
      due_date: invoice?.due_date ?? new Date().toISOString(),
      notes: invoice?.notes ?? '',
      items: invoice?.items ?? [{ description: '', quantity: 1, price: 0, discount: 0 }],
    }), [invoice]),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const [upsertInvoice, { isLoading }] = useUpsertInvoiceMutation();
  const dispatch = useAppDispatch();

  // Autosave draft
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const watchAll = watch();
  useEffect(() => {
    // debounce
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
    // Prepare payload to match backend contract (preserve shapes)
    const payload = { ...values } as any;
    // optimistic update: update cache manually via RTK Query util (best-effort)
    const optimisticId = values._id ?? `temp-${Date.now()}`;
    try {
      const promise = upsertInvoice(payload).unwrap();
      await promise;
      // clear draft
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
        {fields.map((f, i) => (
          <View key={f.id} style={styles.itemRowWrap}>
            <InvoiceItemRow control={control} index={i} name="items" />
            <View style={styles.rowActions}>
              <Button onPress={() => remove(i)}>
                <TText>Remove</TText>
              </Button>
            </View>
          </View>
        ))}

        <Button onPress={() => append({ description: '', quantity: 1, price: 0, discount: 0 })}>
          <TText>Add Item</TText>
        </Button>

        <View style={styles.totals}> 
          <Text>Subtotal: {computeTotals.subtotal.toFixed(2)}</Text>
          <Text>Discount: {computeTotals.discount.toFixed(2)}</Text>
          <Text>Tax: {computeTotals.tax.toFixed(2)}</Text>
          <Text style={{ fontWeight: '700' }}>Total: {computeTotals.total.toFixed(2)}</Text>
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
  scrollContent: { padding: 12 },
  itemRowWrap: { marginBottom: 8, backgroundColor: '#fff', padding: 8, borderRadius: 6 },
  rowActions: { marginTop: 8, alignItems: 'flex-end' },
  totals: { marginTop: 12 },
  footer: { padding: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', backgroundColor: '#fff' },
  saveButton: { width: '100%', backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '700' },
});

export default InvoiceForm;
