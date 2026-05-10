import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from 'react-hook-form';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  rules?: RegisterOptions<T, FieldPath<T>>;
  inputProps?: TextInputProps;
  multiline?: boolean;
};

export function TextInputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rules,
  inputProps,
  multiline,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
        <View style={styles.wrapper}>
          {label && <Text style={styles.label}>{label}</Text>}
          <TextInput
            style={[
              styles.input,
              multiline && { minHeight: 80, paddingTop: 10, textAlignVertical: 'top' },
            ]}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            multiline={multiline}
            {...inputProps}
          />
          {error && <Text style={styles.error}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: '500' },
  input: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  error: { color: '#dc2626', fontSize: 12, marginTop: 4 },
});

export default TextInputField;
