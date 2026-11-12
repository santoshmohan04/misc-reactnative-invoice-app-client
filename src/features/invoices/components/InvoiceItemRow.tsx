import React, { memo } from 'react';
import { View, TextInput, Text, StyleSheet, Platform } from 'react-native';
import { Controller, useWatch } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';

type Props = {
  control: any;
  index: number;
  name: string; // e.g. `items`
  itemOptions: Array<{ label: string; value: string; price: number }>;
  onSelectItem: (index: number, itemId: string) => void;
  onRemove?: () => void;
};

function InvoiceItemRowInner({ control, index, name, itemOptions, onSelectItem }: Props) {
  const prefix = `${name}.${index}`;
  const quantity = Number(useWatch({ control, name: `${prefix}.quantity` }) ?? 0);
  const price = Number(useWatch({ control, name: `${prefix}.price` }) ?? 0);
  const lineSubtotal = Math.max(0, quantity * price);

  return (
    <View style={styles.row}>
      <View style={styles.colLarge}>
        <Text style={styles.label}>Item</Text>
        <Controller
          control={control}
          name={`${prefix}.item` as any}
          defaultValue=""
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View>
              <View style={[styles.pickerWrap, error && styles.invalid]}>
                <Picker
                  selectedValue={value ?? ''}
                  onValueChange={(itemValue) => {
                    const selected = String(itemValue ?? '');
                    onChange(selected);
                    onSelectItem(index, selected);
                  }}
                  onBlur={onBlur}
                  style={styles.picker}
                >
                  <Picker.Item label="Select item" value="" />
                  {itemOptions.map((opt) => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
              {error ? <Text style={styles.error}>{error.message}</Text> : null}
            </View>
          )}
        />
      </View>

      <View style={styles.colSmall}>
        <Text style={styles.label}>Qty</Text>
        <Controller
          control={control}
          name={`${prefix}.quantity` as any}
          defaultValue={0}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View>
              <TextInput
                style={[styles.input, error && styles.invalid]}
                value={value != null ? String(value) : ''}
                onChangeText={(t) => onChange(t === '' ? 0 : Number(t))}
                onBlur={onBlur}
                keyboardType="numeric"
              />
              {error ? <Text style={styles.error}>{error.message}</Text> : null}
            </View>
          )}
        />
      </View>

      <View style={styles.colSmall}>
        <Text style={styles.label}>Subtotal</Text>
        <View style={styles.subtotalWrap}>
          <Text style={styles.subtotalText}>{lineSubtotal.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 8 },
  colLarge: { flex: 2 },
  colSmall: { flex: 1 },
  label: { fontSize: 12, color: '#475569', marginBottom: 4 },
  input: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  pickerWrap: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
    borderRadius: 6,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  picker: {
    minHeight: 40,
    ...(Platform.OS === 'web'
      ? ({ borderWidth: 0, outlineStyle: 'none', backgroundColor: 'transparent', paddingHorizontal: 8, color: '#0f172a' } as any)
      : {}),
  },
  invalid: { borderColor: '#f32013' },
  error: { color: '#f32013', fontSize: 12, marginTop: 4 },
  subtotalWrap: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  subtotalText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
});

export const InvoiceItemRow = memo(InvoiceItemRowInner);
export default InvoiceItemRow;
