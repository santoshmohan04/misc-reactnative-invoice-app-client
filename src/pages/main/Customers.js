import React, {Component} from 'react';
import {Actions} from '../../utils/NavigationService';
import {FlatList, StyleSheet, View} from 'react-native';
import {Button, Text} from 'tamagui';
import ListView from '../../components/ListView';
import {connect} from 'react-redux';
import EmptyListPlaceHolder from '../../components/EmptyListPlaceHolder';
import {getCurrency} from '../../utils/currencies.utils';
import {formatCurrency} from '../../utils/redux.form.utils';
import PageHeader from '../../components/MainPageHeader';

/**
 * Component that renders the customers list
 */
class Customers extends Component<{}> {
    render() {
        const {getCustomers, getUser: {userDetails}} = this.props;
        const currency = getCurrency(userDetails.base_currency);
        return (
            <View style={styles.container}>
                <PageHeader title={'Customers'}/>
                <View style={styles.content}>
                    {this.renderCustomersList(getCustomers.customersList || [], currency)}
                    <Button
                        circular
                        style={styles.fab}
                        onPress={() => {
                            this.addNewCustomer();
                        }}>
                        <Text style={styles.fabText}>+</Text>
                    </Button>
                </View>
            </View>
        );
    };

    /**
     * called on pressing add button
     * opens customer form page with null to indicate adding a new customer
     */
    addNewCustomer() {
        Actions.customerForm({customer: null});
    }

    /**
     * called on pressing add button
     * opens customer form page with a customer object to indicate editing an existing customer
     *
     * @param customer
     */
    editCustomer(customer) {
        Actions.customerForm({customer: customer});
    }

    /**
     * Dynamically maps customer list to list component
     *
     * @param customersList
     * @param currency
     * @returns {*}
     */
    renderCustomersList(customersList, currency) {
        return (
            <FlatList
                ListEmptyComponent={
                    <EmptyListPlaceHolder
                        type={'item'}
                        message={'No customers found.\nPress the plus button to add new customers.'}/>
                }
                data={customersList}
                renderItem={({item: customer}) => (
                    <ListView
                        title={customer.name}
                        subtitle={`${customer.number_invoices} invoices`}
                        right={formatCurrency(customer.total, currency)}
                        handleClickEvent={() => {
                            this.editCustomer(customer);
                        }}
                    />
                )}
                keyExtractor={(item, index) => item._id || index.toString()}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#5067FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabText: {
        color: '#ffffff',
        fontSize: 28,
        lineHeight: 28,
        marginTop: -2,
    },
});


const mapStateToProps = (state) => ({
    getUser: state.userReducer.getUser,
    getCustomers: state.customerReducer.getCustomers,
});

const mapDispatchToProps = (dispatch) => ({
    dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Customers);
