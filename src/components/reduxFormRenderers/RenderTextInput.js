import React from 'react';
import {Ionicons} from '@expo/vector-icons';
import {StyleSheet, Text, TextInput, View} from 'react-native';

/**
 * Renders a text input component based on supplied field parameters.
 *
 * @param field
 * @returns {*}
 */
const renderTextInput = (field) => {
    const {meta: {touched, error}, label, secureTextEntry, value, maxLength, keyboardType, placeholder, textAlign, icon, editable, input: {onChange, ...restInput}} = field;

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputRow}>
                {icon && <Ionicons name={icon} size={18} color={'#64748b'} style={styles.icon}/>} 
                <TextInput
                    style={[styles.input, textAlign ? {textAlign} : null]}
                    underlineColorAndroid='transparent'
                    onChangeText={onChange}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    value={value === undefined || value === null ? '' : String(value)}
                    editable={editable}
                    placeholderTextColor={'#94a3b8'}
                    {...restInput}
                />
            </View>
            {(touched && error) && <Text style={styles.error}>{error}</Text>}
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
    inputRow: {
        minHeight: 42,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(15,23,42,0.18)',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        paddingHorizontal: 10,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: '#0f172a',
        fontSize: 15,
        paddingVertical: 10,
    },
    error: {
        color: '#f32013',
        marginTop: 4,
        fontSize: 12,
    },
});

export default renderTextInput;
