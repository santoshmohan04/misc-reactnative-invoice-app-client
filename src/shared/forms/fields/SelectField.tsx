import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from 'react-hook-form';
import { Select } from 'tamagui';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  rules?: RegisterOptions<T, FieldPath<T>>;
  options: Array<{ label: string; value: string | number }>;
};

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rules,
  options,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.wrapper}>
          {label && <Text style={styles.label}>{label}</Text>}
          <Select value={String(value ?? '')} onValueChange={onChange}>
            <Select.Trigger>
              <Select.Value placeholder={placeholder} />
            </Select.Trigger>
            <Select.Content>
              <Select.ScrollUpButton />
              {options.map((opt, index) => (
                <Select.Item key={opt.value} index={index} value={String(opt.value)}>
                  <Select.ItemText>{opt.label}</Select.ItemText>
                </Select.Item>
              ))}
              <Select.ScrollDownButton />
            </Select.Content>
          </Select>
          {error && <Text style={styles.error}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: '500' },
  error: { color: '#dc2626', fontSize: 12, marginTop: 4 },
});

export default SelectField;
