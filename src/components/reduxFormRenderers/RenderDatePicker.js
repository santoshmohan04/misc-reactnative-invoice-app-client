import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Platform, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

const formatDate = (value) => {
    if (!value) {
        return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
};

const parseDate = (raw) => {
    if (!raw) {
        return null;
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
};

const renderDatePicker = (fields) => {
    const {input, placeholder, meta: {touched, error}, label, ...custom} = fields;
    const [showPicker, setShowPicker] = React.useState(false);
    const selectedDate = parseDate(input.value);

    const onDateChange = (_, dateValue) => {
        setShowPicker(false);
        if (dateValue) {
            input.onChange(dateValue);
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            {Platform.OS === 'web' ? (
                <TextInput
                    style={styles.input}
                    value={formatDate(selectedDate)}
                    onChangeText={(value) => {
                        const parsed = parseDate(value);
                        input.onChange(parsed || value);
                    }}
                    placeholder={placeholder || 'YYYY-MM-DD'}
                    placeholderTextColor={'#94a3b8'}
                />
            ) : (
                <>
                    <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
                        <Text style={selectedDate ? styles.valueText : styles.placeholderText}>
                            {selectedDate ? formatDate(selectedDate) : (placeholder || 'YYYY-MM-DD')}
                        </Text>
                    </Pressable>

                    {showPicker && (
                        <DateTimePicker
                            value={selectedDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            {...custom}
                        />
                    )}
                </>
            )}

            {touched && error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 6,
    },
    label: {
        marginBottom: 6,
        color: '#475569',
        fontSize: 13,
    },
    input: {
        minHeight: 42,
        borderWidth: 1,
        borderColor: 'rgba(15,23,42,0.18)',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    valueText: {
        color: '#0f172a',
        fontSize: 15,
    },
    placeholderText: {
        color: '#94a3b8',
        fontSize: 15,
    },
    error: {
        color: '#f32013',
        marginTop: 4,
        fontSize: 12,
    },
});

export default renderDatePicker;
