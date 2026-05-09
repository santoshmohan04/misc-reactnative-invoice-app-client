import React, {Component} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Button, Text} from 'tamagui';
import ListView from '../../components/ListView';
import {Actions} from '../../utils/NavigationService';
import Loader from '../../components/Loader';
import {connect} from 'react-redux';
import Logo from '../../components/Logo';
import EmptyListPlaceHolder from '../../components/EmptyListPlaceHolder';
import {getCurrency} from '../../utils/currencies.utils';
import {formatCurrency} from '../../utils/redux.form.utils';
import PageHeader from '../../components/MainPageHeader';

/**
 * Component that renders the items list
 */
class Items extends Component<{}> {
    render() {
        const {getItems, getUser: {userDetails}} = this.props;
        const currency = getCurrency(userDetails.base_currency);
        return (
            <View style={styles.container}>
                {getItems.isLoading && <Loader/>}
                <PageHeader title={'Items'}/>
                <View style={styles.content}>
                    {this.renderItemsList(getItems.itemsList || [], currency)}
                    <Button
                        circular
                        style={styles.fab}
                        onPress={() => {
                            this.addNewItem();
                        }}>
                        <Text style={styles.fabText}>+</Text>
                    </Button>
                </View>
            </View>
        );
    };

    /**
     * called on pressing add button
     * opens item form page with null to indicate adding a new item
     */
    addNewItem() {
        Actions.itemForm({item: null});
    }

    /**
     * called on pressing add button
     * opens item form page with an item object to indicate editing an existing item
     *
     * @param item
     */
    editItem(item) {
        Actions.itemForm({item: item});
    }

    /**
     * Dynamically maps item list to list component
     *
     * @param itemsList
     * @param currency
     * @returns {*}
     */
    renderItemsList(itemsList, currency) {
        return (
            <FlatList
                ListEmptyComponent={
                    <EmptyListPlaceHolder
                        type={'item'}
                        message={'No items found.\nPress the plus button to add new items.'}/>
                }
                data={itemsList}
                renderItem={({item}) => (
                    <ListView
                        title={item.name}
                        subtitle={item.description}
                        right={formatCurrency(item.price, currency)}
                        ListEmptyComponent={Logo}
                        handleClickEvent={() => {
                            this.editItem(item);
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

/**
 * map props to item reducer to get items list
 * map props to user reducer to get base currency
 *
 * @param state
 * @returns {{getItems: getItems, getUser: getUser}}
 */
const mapStateToProps = (state) => ({
    getItems: state.itemReducer.getItems,
    getUser: state.userReducer.getUser,
});

const mapDispatchToProps = (dispatch) => ({
    dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Items);
