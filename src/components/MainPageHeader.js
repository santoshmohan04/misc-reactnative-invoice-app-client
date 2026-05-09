import React, {Component} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Button, Text, XStack} from 'tamagui';
import {getInvoicesList} from '../actions/invoice.actions';
import {getCustomersList} from '../actions/customer.actions';
import {getItemsList} from '../actions/item.actions';
import {Actions} from '../utils/NavigationService';
import {ErrorUtils} from '../utils/error.utils';
import {connect} from 'react-redux';
import {getUser} from '../actions/auth.actions';

/**
 * Header component for main pages.
 * Contains a button that opens profile page and a refresh button tat loads all data.
 */
class MainPageHeader extends Component<{}> {
    /**
     * Dispatches actions to load all application data
     *
     * @returns {Promise<void>}
     */
    refreshData = async () => {
        await Promise.all([
            await this.props.dispatch(getUser()),
            await this.props.dispatch(getInvoicesList()),
            await this.props.dispatch(getCustomersList()),
            await this.props.dispatch(getItemsList())])
            .then((responses) => {
                if (responses[0].success && responses[1].success && responses[2].success) {
                    Alert.alert('Success', 'Data was successfully updated.');
                } else {
                    throw 'Something went wrong. Check connection or try again later.';
                }
            }).catch((e) => {
                const newError = new ErrorUtils(e);
                newError.showAlert();
            });
    };

    render() {
        return (
            <XStack style={styles.header}>
                <Button chromeless onPress={() => {
                        Actions.profile();
                    }}>
                    <Ionicons name='person-outline' size={22} color='#0f172a'/>
                </Button>
                <Text style={styles.title}>{this.props.title}</Text>
                <Button chromeless onPress={() => {
                        this.refreshData();
                    }}>
                    <Ionicons name='refresh' size={22} color='#0f172a'/>
                </Button>
            </XStack>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
});

const mapDispatchToProps = (dispatch) => ({
    dispatch,
});

export default connect(null, mapDispatchToProps)(MainPageHeader);
