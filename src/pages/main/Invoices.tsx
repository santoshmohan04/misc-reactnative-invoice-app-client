import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'tamagui';
import moment from 'moment';
import ListView from '../../components/ListView';
import EmptyListPlaceHolder from '../../components/EmptyListPlaceHolder';
import Loader from '../../components/Loader';
import PageHeader from '../../components/MainPageHeader';
import { Actions } from '../../utils/NavigationService';
import { getCurrency } from '../../utils/currencies.utils';
import { formatCurrency } from '../../utils/redux.form.utils';
import { zeroPad } from '../../utils/general.utils';
import { useGetInvoicesQuery, useGetCustomersQuery } from '../../store/apis/dataApi';
import { useAuthUser } from '../../store/hooks';
import type { Customer, Invoice } from '../../types';

type InvoiceRecord = Invoice & { customer?: string };
type CustomerRecord = Customer & { total?: number; number_invoices?: number };

const Invoices: React.FC = () => {
  const user = useAuthUser();
  const currency = getCurrency(user?.base_currency);

  const { data: invoicesData = [], isLoading, refetch } = useGetInvoicesQuery();
  const { data: customersData = [] } = useGetCustomersQuery();

  const invoicesList = invoicesData as InvoiceRecord[];
  const customersList = customersData as CustomerRecord[];

  const addNewInvoice = (): void => {
    const newNumber = zeroPad(invoicesList.length, 8);
    Actions.invoiceForm({ invoice: null, newNumber });
  };

  return (
    <View style={styles.container}>
      {isLoading && <Loader />}
      <PageHeader title="Invoices" />
      <View style={styles.content}>
        <FlatList
          ListEmptyComponent={
            <EmptyListPlaceHolder
              type="item"
              message="No invoices found.\nPress the plus button to add new items."
            />
          }
          data={invoicesList}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item: invoice }) => (
            <ListView
              title={(customersList.find((c) => c._id === invoice.customer) || {}).name}
              subtitle={invoice.number}
              right={formatCurrency(invoice.total, currency)}
              rightSub={moment(invoice.issued).format('DD/MM/YYYY')}
              handleClickEvent={() => Actions.invoiceForm({ invoice })}
            />
          )}
          keyExtractor={(item, index) => item._id || index.toString()}
        />
        <Button circular style={styles.fab} onPress={addNewInvoice}>
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

export default Invoices;
