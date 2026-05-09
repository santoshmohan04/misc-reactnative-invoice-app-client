import React, { memo } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';

type Props = {
  control: any;
  index: number;
  name: string; // e.g. `items`
  onRemove?: () => void;
};

function InvoiceItemRowInner({ control, index, name }: Props) {
  const prefix = `${name}.${index}`;
  return (
    <View style={styles.row}>
      <View style={styles.colLarge}>
        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name={`${prefix}.description` as any}
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Item description" />
          )}
        />
      </View>

      <View style={styles.colSmall}>
        <Text style={styles.label}>Qty</Text>
        <Controller
          control={control}
          name={`${prefix}.quantity` as any}
          defaultValue={0}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value != null ? String(value) : ''}
              onChangeText={(t) => onChange(t === '' ? 0 : Number(t))}
              keyboardType="numeric"
            />
          )}
        />
      </View>

      <View style={styles.colSmall}>
        <Text style={styles.label}>Price</Text>
        <Controller
          control={control}
          name={`${prefix}.price` as any}
          defaultValue={0}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value != null ? String(value) : ''}
              onChangeText={(t) => onChange(t === '' ? 0 : Number(t))}
              keyboardType="numeric"
            />
          )}
        />
      </View>

      <View style={styles.colSmall}>
        <Text style={styles.label}>Discount %</Text>
        <Controller
          control={control}
          name={`${prefix}.discount` as any}
          defaultValue={0}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value != null ? String(value) : ''}
              onChangeText={(t) => onChange(t === '' ? 0 : Number(t))}
              keyboardType="numeric"
            />
          )}
        />
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
});

export const InvoiceItemRow = memo(InvoiceItemRowInner);
export default InvoiceItemRow;
