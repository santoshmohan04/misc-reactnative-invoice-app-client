import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'tamagui';
import ListView from '../../components/ListView';
import EmptyListPlaceHolder from '../../components/EmptyListPlaceHolder';
import Loader from '../../components/Loader';
import PageHeader from '../../components/MainPageHeader';
import { Actions } from '../../utils/NavigationService';
import { getCurrency } from '../../utils/currencies.utils';
import { formatCurrency } from '../../utils/redux.form.utils';
import { useGetItemsQuery } from '../../store/apis/dataApi';
import { useAuthUser } from '../../store/hooks';

const Items = () => {
    const user = useAuthUser();
    const currency = getCurrency(user?.base_currency);
    const { data: itemsList = [], isLoading, refetch } = useGetItemsQuery();

    return (
        <View style={styles.container}>
            {isLoading && <Loader />}
            <PageHeader title="Items" />
            <View style={styles.content}>
                <FlatList
                    ListEmptyComponent={
                        <EmptyListPlaceHolder
                            type="item"
                            message="No items found.\nPress the plus button to add new items."
                        />
                    }
                    data={itemsList}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    renderItem={({ item }) => (
                        <ListView
                            title={item.name}
                            subtitle={item.description}
                            right={formatCurrency(item.price, currency)}
                            handleClickEvent={() => Actions.itemForm({ item })}
                        />
                    )}
                    keyExtractor={(item, index) => item._id || index.toString()}
                />
                <Button circular style={styles.fab} onPress={() => Actions.itemForm({ item: null })}>
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

export default Items;
