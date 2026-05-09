import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'tamagui';
import ListView from '../../components/ListView';
import EmptyListPlaceHolder from '../../components/EmptyListPlaceHolder';
import PageHeader from '../../components/MainPageHeader';
import { Actions } from '../../utils/NavigationService';
import { getCurrency } from '../../utils/currencies.utils';
import { formatCurrency } from '../../utils/redux.form.utils';
import { useGetCustomersQuery } from '../../store/apis/dataApi';
import { useAuthUser } from '../../store/hooks';

const Customers = () => {
    const user = useAuthUser();
    const currency = getCurrency(user?.base_currency);
    const { data: customersList = [], isLoading, refetch } = useGetCustomersQuery();

    return (
        <View style={styles.container}>
            <PageHeader title="Customers" />
            <View style={styles.content}>
                <FlatList
                    ListEmptyComponent={
                        <EmptyListPlaceHolder
                            type="item"
                            message="No customers found.\nPress the plus button to add new customers."
                        />
                    }
                    data={customersList}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    renderItem={({ item: customer }) => (
                        <ListView
                            title={customer.name}
                            subtitle={`${customer.number_invoices || 0} invoices`}
                            right={formatCurrency(customer.total, currency)}
                            handleClickEvent={() => Actions.customerForm({ customer })}
                        />
                    )}
                    keyExtractor={(item, index) => item._id || index.toString()}
                />
                <Button circular style={styles.fab} onPress={() => Actions.customerForm({ customer: null })}>
                    <Text style={styles.fabText}>+</Text>
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
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

export default Customers;
