import React, { Component } from 'react';
import {Actions} from '../../utils/NavigationService';
import {Ionicons} from '@expo/vector-icons';
import {Button, Text} from 'tamagui';
import {Alert, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import renderTextInput from '../../components/reduxFormRenderers/RenderTextInput';
import renderItemsTextInputArray from '../../components/reduxFormRenderers/RenderItemsInputArray';
import {change, Field, FieldArray, formValueSelector, reduxForm} from 'redux-form';
import {bindActionCreators, compose} from 'redux';
import {connect} from 'react-redux';
import {
    formatCurrency,
    normalizeCurrency,
    number,
    required,
    validatePositiveTimeDifference,
} from '../../utils/redux.form.utils';
import {ErrorUtils} from '../../utils/error.utils';
import {editInvoice, getInvoicesList, sendInvoiceByEmail} from '../../actions/invoice.actions';
import Loader from '../../components/Loader';
import renderSelectOption from '../../components/reduxFormRenderers/RenderSelectOption';
import renderDatePicker from '../../components/reduxFormRenderers/RenderDatePicker';
import {getCurrency} from '../../utils/currencies.utils';
import InnerPageHeader from '../../components/InnerPageHeader';
import Constants from 'expo-constants';

/**
 * Form component for adding editing, or sending an invoice.
 */
class InvoiceForm extends Component {

    /**
     * Dispatches an action to edit or add invoice
     * alerts on error and refreshes list on success
     * *
     * @param values
     * @returns {Promise<{success}|*>}
     */
    sendInvoiceData = async (values) => {
        try {
            const response = await this.props.dispatch(editInvoice(values));
            if (!response || !response.success) {
                throw response;
            } else {
                await this.refreshInvoicesList();
                return response;
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    };

    /**
     * Called after modifying invoice data by editing or adding.
     * dispatches action to load invoice list with changes
     *
     * @returns {Promise<void>}
     */
    refreshInvoicesList = async () => {
        try {
            const response = await this.props.dispatch(getInvoicesList());
            if (!response || !response.success) {
                throw response;
            } else {
                Alert.alert('Success', 'Invoices list successfully updated.');
                return response;
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    };

    /**
     * After saving the invoice this method  sets up and sends a payment session by emails
     *
     * @param values
     * @returns {Promise<{success}|*>}
     */
    sendInvoiceByEmail = async (values) => {
        try {
            let response = await this.sendInvoiceData(values);
            if (!response.success) {
                throw response;
            } else {
                // Build payment params matching backend Payment model: { invoice, amount, currency, method }
                const invoice = response.responseBody;
                let paymentParams = {
                    invoice: invoice._id,
                    amount: invoice.total,
                    currency: (this.props.getUser?.userDetails?.base_currency) || 'USD',
                    method: 'card',
                };
                response = await this.props.dispatch(sendInvoiceByEmail(paymentParams));
                if (!response || !response.success) {
                    throw response;
                } else {
                    Alert.alert('Success', 'Invoice was successfully sent by email.');
                    return response;
                }
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    };

    onSendInvoice = (values) => {
        this.sendInvoiceByEmail(values);
    };

    onSubmit = (values) => {
        this.sendInvoiceData(values);
    };

    render() {
        const {handleSubmit, editInvoice, getItems, getCustomers, subtotalValue, change, getUser: {userDetails}} = this.props;
        const currency = getCurrency(userDetails.base_currency);
        return (
            <View style={styles.container}>
                {editInvoice.isLoading && <Loader/>}
                <InnerPageHeader title={'Invoice'}/>
                <View style={styles.content}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.card}>
                            <View style={styles.cardItem}>
                                <Field name={'number'}
                                       keyboardType={'default'}
                                       placeholder={'INV0000'}
                                       validate={[required]}
                                       component={renderTextInput}/>
                            </View>
                            <View style={styles.cardItem}>
                                <Field
                                    component={renderDatePicker}
                                    keyboardType='default'
                                    name={'issued'}
                                    label={'Issued: '}
                                    placeholder="YYYY/MM/DD"
                                    validate={[required]}
                                />
                            </View>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.cardItem}>
                                <Field name={`customer`}
                                       component={renderSelectOption}
                                       iosHeader="Select Customer"
                                       placeHolder={'Select a customer...'}
                                       optionsArray={(getCustomers.customersList || [])}
                                       label={'To: '}
                                       validate={[required]}
                                       placeholder={'Customer'}/>
                            </View>
                            <View style={styles.cardItem}>
                                <Field
                                    component={renderDatePicker}
                                    keyboardType='default'
                                    name={'due'}
                                    label={'Due: '}
                                    placeholder="YYYY/MM/DD"
                                    validate={[required]}
                                />
                            </View>
                        </View>
                        <FieldArray name="items"
                                    optionsArray={getItems.itemsList || []}
                                    change={change}
                                    currency={currency}
                                    component={renderItemsTextInputArray}
                        />
                        <View style={styles.card}>
                            <TouchableOpacity style={styles.computeRow} onPress={handleSubmit(this.calculateSubTotal)}>
                                <Ionicons name="calculator-outline" size={20} color="#0f172a"/>
                                <Text style={styles.computeText}>Compute Total</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.card}>
                            <View style={[styles.cardItem, styles.grayRow]}>
                                <Field name={'subtotal'}
                                       keyboardType={'numeric'}
                                       placeholder={'0'}
                                       label={'Subtotal'}
                                       textAlign={'right'}
                                       defaultValue={'0'}
                                       editable={false}
                                       format={value => (formatCurrency(value, currency))}
                                       normalize={value => (normalizeCurrency(value))}
                                       validate={[required, number]}
                                       component={renderTextInput}/>
                            </View>
                            <View style={styles.cardItem}>
                                <Field name={'discount'}
                                       keyboardType={'numeric'}
                                       placeholder={'0'}
                                       label={'Discount'}
                                       textAlign={'right'}
                                       onChange={(value) => {
                                           value = normalizeCurrency(value);
                                           change('total', String(Number(subtotalValue) - Number(value)));
                                       }}
                                       format={value => (formatCurrency(value, currency))}
                                       normalize={value => (normalizeCurrency(value))}
                                       validate={[required, number]}
                                       component={renderTextInput}/>
                            </View>
                            <View style={[styles.cardItem, styles.grayRow]}>
                                <Field name={'total'}
                                       keyboardType={'numeric'}
                                       placeholder={'0'}
                                       label={'Total'}
                                       textAlign={'right'}
                                       editable={false}
                                       format={value => (formatCurrency(value, currency))}
                                       normalize={value => (normalizeCurrency(value))}
                                       validate={[required, number]}
                                       component={renderTextInput}/>
                            </View>
                        </View>
                        <View style={styles.bottomSpacer}/>
                    </ScrollView>
                    <Button
                        circular
                        style={styles.fab}
                        onPress={handleSubmit(this.onSendInvoice)}>
                        <Ionicons name="send" size={20} color="#ffffff"/>
                    </Button>
                </View>
                <View style={styles.footer}>
                    <Button style={styles.saveButton} onPress={handleSubmit(this.onSubmit)}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </Button>
                </View>
            </View>
        );
    };

    /**
     * After submitting field values this method retrieves items data to compute subtotal.
     * The method is called on submit because the fields' state or the item field array
     * will always appear one step behind real state when called or retrieved by a selector.
     * By submitting data, redux updates all fields with correct values.
     *
     * @param values
     */
    calculateSubTotal = (values) => {
        if (values.items) {
            let allItemsSubtotal = values.items.reduce(function (a, b) {
                return a + Number(b.subtotal);
            }, 0);
            values.subtotal = String(allItemsSubtotal);
            values.total = String(allItemsSubtotal - Number(values.discount));
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 12,
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
    grayRow: {
        backgroundColor: 'lightgray',
    },
    computeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    computeText: {
        marginLeft: 10,
        color: '#0f172a',
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 80,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#5067FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
        padding: 10,
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    bottomSpacer: {
        height: 72,
    },
});

/**
 * Selects redux-form fields to get their values
 */
const selector = formValueSelector('invoiceForm');

/**
 * Retrieves initial field values in case of editing
 * maps props to different data reducers since most of the data is used by the invoice component
 *
 * @param state
 * @param props
 * @returns {{initialValues: *, editInvoice: editInvoice, getInvoices: getInvoices, getItems: getItems, getCustomers: getCustomers, getUser: getUser, subtotalValue: *}}
 */
const mapStateToProps = (state, props) => {
    let initialValues, subtotalValue = selector(state, 'subtotal');
    if (props.invoice) {
        props.invoice.items.forEach((item) => {
            item.quantity = String(item.quantity);
            item.subtotal = String(item.subtotal);
        });
        initialValues = {
            number: props.invoice.number,
            customer: props.invoice.customer,
            issued: new Date(props.invoice.issued),
            due: new Date(props.invoice.due),
            items: props.invoice.items,
            subtotal: props.invoice.subtotal.toString(),
            discount: props.invoice.discount.toString(),
            total: props.invoice.total.toString(),
        };
    } else {
        initialValues = {
            number: `INV${props.newNumber}`,
            customer: null,
            items: [{item: null, quantity: '0', subtotal: '0'}],
            subtotal: '0',
            discount: '0',
            total: '0',
        };
    }

    return ({
        initialValues,
        getUser: state.userReducer.getUser,
        editInvoice: state.invoiceReducer.editInvoice,
        getInvoices: state.invoiceReducer.getInvoices,
        getCustomers: state.customerReducer.getCustomers,
        getItems: state.itemReducer.getItems,
        subtotalValue,
    });
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({change}, dispatch);
};

const validate = (values) => ({
    due: validatePositiveTimeDifference(values.issued, values.due),
});


export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    reduxForm({
        form: 'invoiceForm',
        validate,
        enableReinitialize: true,
        keepDirtyOnReinitialize: true,
        updateUnregisteredFields: true,
    }),
)(InvoiceForm);
