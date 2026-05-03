import React, {Component} from 'react';
import * as RNRF from 'react-native-router-flux';
import {
    CustomerForm,
    Customers,
    InvoiceForm,
    Invoices,
    ItemForm,
    Items,
    Login,
    Profile,
    SignUp,
    Splash,
} from '../pages/index';
import {connect} from 'react-redux';
import NavBar from './NavBar';

// Fallback for native-base if it fails to load
let Root;
try {
    const NB = require('native-base');
    Root = NB.Root;
    console.log('native-base Root loaded');
} catch (e) {
    console.error('Failed to load native-base:', e);
    Root = ({children}) => children;
}

const Router = RNRF.Router || (RNRF.default && RNRF.default.Router);
const Scene = RNRF.Scene || (RNRF.default && RNRF.default.Scene);

/**
 * React-native-router-flux router component.
 */
class Routes extends Component<{}> {

    render() {
        console.log('Routes render - Router exists:', !!Router);

        if (!Router || !Scene) {
            const {View, Text} = require('react-native');
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Router not found!</Text>
                </View>
            );
        }

        const RouterWithRedux = connect()(Router);

        return (
            <Root>
                <RouterWithRedux>
                    <Scene>
                        <Scene key={'root'} hideNavBar={true} initial={!this.props.isLoggedIn}>
                            <Scene key="login" component={Login} title="Login" initial={true}/>
                            <Scene key="signup" component={SignUp} title="Sign Up"/>
                        </Scene>
                        <Scene key={'app'} hideNavBar={true} initial={this.props.isLoggedIn}>
                            <Scene key="splash" title="Splash" initial={this.props.isLoggedIn} component={Splash}/>
                            <Scene key="home" title="Home" tabs
                                   tabBarComponent={NavBar}>
                                <Scene key="invoices" component={Invoices} title="Invoices" hideNavBar initial/>
                                <Scene key="customers" component={Customers} title="Customers" hideNavBar/>
                                <Scene key="items" component={Items} title="Items" hideNavBar/>
                            </Scene>
                            <Scene key="customerForm" component={CustomerForm} title="Customer" hideNavBar/>
                            <Scene key="itemForm" component={ItemForm} title="Item" hideNavBar/>
                            <Scene key="invoiceForm" component={InvoiceForm} title="Invoice" hideNavBar/>
                            <Scene key="profile" component={Profile} title="Profile" hideNavBar/>
                        </Scene>
                    </Scene>
                </RouterWithRedux>
            </Root>
        );
    }
}

export default Routes;
