import React from 'react';
import {Ionicons} from '@expo/vector-icons';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Field} from 'redux-form';
import renderTextInput from './RenderTextInput';
import renderSelectOption from './RenderSelectOption';
import {formatCurrency, integer, normalizeCurrency, number, required} from '../../utils/redux.form.utils';

/**
 * Renders an array of field tuples for redux-form. Each tuple has an item selector and a quantity input field
 *
 * @returns {*}
 * @param field
 */
const renderItemsInputArray = (field) => {
    const {fields, change, optionsArray, meta: {error, touched}, currency} = field;

    return (
        <View style={styles.container}>
            {fields.map((item, index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.cardItem}>
                            <Field name={`${item}.item`}
                                   component={renderSelectOption}
                                   optionsArray={optionsArray}
                                   iosHeader="Select Item"
                                   placeHolder={'Select an item...'}
                                   placeholder={'Item'}
                                   validate={[required]}
                                   onChange={(value) => {
                                       // Calculate product subtotal based on new product
                                       let quantity = Number(fields.get(index).quantity);
                                       let itemValue = (optionsArray || []).find((e) => e._id === value);
                                       if (quantity && itemValue) {
                                           change(`${item}.subtotal`, String(quantity * itemValue.price));
                                       }
                                   }}/>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.halfColumn}>
                            <Field
                                name={`${item}.quantity`}
                                keyboardType={'decimal-pad'}
                                placeholder={'0'}
                                textAlign={'right'}
                                label={'Quantity'}
                                component={renderTextInput}
                                validate={[required, integer]}
                                onChange={(value) => {
                                    // Calculate product subtotal based on new quantity
                                    let itemValue = (optionsArray || []).find((e) => e._id === fields.get(index).item);
                                    if (itemValue) {
                                        change(`${item}.subtotal`, String(Number(value) * itemValue.price));
                                    }
                                }}/>
                        </View>
                        <View style={styles.halfColumn}>
                            <Field
                                name={`${item}.subtotal`}
                                keyboardType={'decimal-pad'}
                                placeholder={'0'}
                                textAlign={'right'}
                                editable={false}
                                validate={[required, number]}
                                format={value => (formatCurrency(value, currency))}
                                normalize={value => (normalizeCurrency(value))}
                                component={renderTextInput}/>
                            {(touched && error) && <Text style={{color: '#f32013'}}>{error}</Text>}
                        </View>
                    </View>
                    <TouchableOpacity style={styles.actionRow} onPress={() => fields.remove(index)}>
                        <Ionicons name='trash-outline' size={18} color={'#0f172a'}/>
                        <Text style={styles.actionText}>Remove Item</Text>
                    </TouchableOpacity>

                </View>
            ))}
            <View style={styles.card}>
                <TouchableOpacity style={styles.actionRow} onPress={() => fields.push({})}>
                    <Ionicons name="add-outline" size={18} color={'#0f172a'}/>
                    <Text style={styles.actionText}>Add Item</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
    cardItem: {
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    row: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        gap: 10,
    },
    halfColumn: {
        flex: 1,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
    actionText: {
        marginLeft: 8,
        color: '#0f172a',
        fontWeight: '600',
    },
});

export default renderItemsInputArray;

