import React, {Component} from 'react';
import {Button, Footer, FooterTab, Icon, Text} from 'native-base';

/**
 * Navigation bar component for main app landing page.
 * Contains buttons for invoices , customers and items list pages
 */
class NavBar extends Component<{}> {
    /**
     * Constructs a local state for navigation
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            scene: 1,
        };
    }

    render() {
        const { state, navigation } = this.props;
        const currentIndex = state.index;

        return (
            <Footer>
                <FooterTab>
                    <Button vertical
                            active={currentIndex === 0}
                            onPress={() => {
                                navigation.navigate('invoices');
                            }}>
                        <Icon name="file-invoice-dollar" type={'FontAwesome5'}/>
                        <Text>Invoice</Text>
                    </Button>
                    <Button vertical
                            active={currentIndex === 1}
                            onPress={() => {
                                navigation.navigate('customers');
                            }}>
                        <Icon name="ios-people"/>
                        <Text>Customers</Text>
                    </Button>
                    <Button vertical
                            active={currentIndex === 2}
                            onPress={() => {
                                navigation.navigate('items');
                            }}>
                        <Icon active name="ios-barcode"/>
                        <Text>Items</Text>
                    </Button>
                </FooterTab>
            </Footer>
        );
    }
}

export default NavBar;
