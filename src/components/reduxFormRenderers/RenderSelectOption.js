import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';

/**
 * Renders a Picker component with options retrieved from a specified array of [{_id,_name,...}].
 *
 * @returns {*}
 * @param field
 */
const renderSelectOption = (field) => {
    const {meta: {touched, error}, input: {onChange, value, ...inputProps}, placeHolder, label, optionsArray, ...pickerProps} = field;

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={value ?? ''}
                    onValueChange={(newValue) => onChange(newValue === '' ? null : newValue)}
                    {...inputProps}
                    {...pickerProps}
                >
                    <Picker.Item label={placeHolder} value=""/>
                    {(optionsArray || []).map((option, i) => (
                        <Picker.Item key={option._id || i}
                                     value={option._id}
                                     label={option.name}/>
                    ))}
                </Picker>
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
    pickerWrapper: {
        borderWidth: 1,
        borderColor: 'rgba(15,23,42,0.18)',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
    },
    error: {
        color: '#f32013',
        marginTop: 4,
        fontSize: 12,
    },
});

export default renderSelectOption;


