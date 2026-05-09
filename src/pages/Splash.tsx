import React, { Component } from 'react';
import { Card, CardItem, Container } from 'native-base';
import {ScrollView, BackHandler} from 'react-native';
import {Actions} from '../utils/NavigationService';
import Logo from '../components/Logo';
import {connect} from 'react-redux';
import {getInvoicesList} from '../actions/invoice.actions';
import {ErrorUtils} from '../utils/error.utils';
import {getCustomersList} from '../actions/customer.actions';
import {getItemsList} from '../actions/item.actions';
import * as SplashScreen from 'expo-splash-screen';

interface Props {
    dispatch: any;
    getInvoices: any;
    getCustomers: any;
    getItems: any;
    getUser: any;
}

// Keep splash screen visible while fetching data
SplashScreen.preventAutoHideAsync();

/**
 * Splash component to load all data before starting app session
 */
class Splash extends Component<Props> {

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
                throw 'Something went wrong. Check connection or try again later.';
            }
        }).catch((e) => {
            const newError = new ErrorUtils(e);
            (newError as any).showAlert();
            setTimeout(() => {
                BackHandler.exitApp();
            }, 4000);
        });

    }

    render() {
        return (
            <Container>
                <ScrollView padder contentContainerStyle={{display: 'flex', flexGrow: 1, justifyContent: 'center'}}>
                    <Card transparent>
                        <CardItem>
                            <Logo/>
                        </CardItem>
                    </Card>
                </ScrollView>
            </Container>
        );
    };
}

/**
 * maps props to data reducers to get request statuses
 *
 * @param state
 * @returns {{getInvoices: getInvoices, getItems: getItems, getCustomers: getCustomers, getUser: getUser}}
 */
const mapStateToProps = (state: any) => ({
    getInvoices: state.invoiceReducer.getInvoices,
    getCustomers: state.customerReducer.getCustomers,
    getItems: state.itemReducer.getItems,
    getUser: state.userReducer.getUser,
});

const mapDispatchToProps = (dispatch: any) => ({
    dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
