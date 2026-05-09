import React, { Component } from 'react';
import {ScrollView, BackHandler, StyleSheet, View} from 'react-native';
import {Actions} from '../utils/NavigationService';
import Logo from '../components/Logo';
import {connect} from 'react-redux';
import {getInvoicesList} from '../actions/invoice.actions';
import {ErrorUtils} from '../utils/error.utils';
import {getCustomersList} from '../actions/customer.actions';
import {getItemsList} from '../actions/item.actions';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while fetching data
SplashScreen.preventAutoHideAsync();

/**
 * Splash component to load all data before starting app session
 */
class Splash extends Component {

    /**
     * Loads all data in all or none fashion.
     * On success app session starts and on fail app exits
     */
    async componentDidMount() {
        await Promise.all([
            this.props.dispatch(getInvoicesList()),
            this.props.dispatch(getCustomersList()),
            this.props.dispatch(getItemsList())
        ]).then(async (responses) => {
            if (responses[0].success && responses[1].success && responses[2].success) {
                await SplashScreen.hideAsync();
                Actions.replace('home');
            } else {
                throw new Error('Something went wrong. Check connection or try again later.');
            }
        }).catch((e) => {
            const newError = new ErrorUtils(e);
            newError.showAlert();
            setTimeout(() => {
                BackHandler.exitApp();
            }, 4000);
        });

    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <Logo/>
                    </View>
                </ScrollView>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        padding: 12,
    },
});

/**
 * maps props to data reducers to get request statuses
 *
 * @param state
 * @returns {{getInvoices: getInvoices, getItems: getItems, getCustomers: getCustomers, getUser: getUser}}
 */
const mapStateToProps = (state) => ({
    getInvoices: state.invoiceReducer.getInvoices,
    getCustomers: state.customerReducer.getCustomers,
    getItems: state.itemReducer.getItems,
    getUser: state.userReducer.getUser,
});

const mapDispatchToProps = (dispatch) => ({
    dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
