import React, {Component} from 'react';
import {Button, Card, CardItem, Container, Footer, FooterTab, Text, Toast} from 'native-base';
import {ScrollView} from 'react-native';
import renderTextInput from '../../components/reduxFormRenderers/RenderTextInput';
import {Field, reduxForm} from 'redux-form';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {email, phone, required} from '../../utils/redux.form.utils';
import {ErrorUtils} from '../../utils/error.utils';
import {editCustomer, getCustomersList} from '../../actions/customer.actions';
import Loader from '../../components/Loader';
import InnerPageHeader from '../../components/InnerPageHeader';

/**
 * Form component for adding a new customer or editing an existing one
 */
class CustomerForm extends Component<{}> {

    /**
     * Dispatches an action to edit or add customer
     * alerts on error and refreshes list on success
     *
     * @param values
     * @returns {Promise<void>}
     */
    modifyCustomerData = async (values) => {
        try {
            const response = await this.props.dispatch(editCustomer(values));
            if (!response.success) {
                throw response;
            } else {
                await this.refreshCustomersList();
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    };

    /**
     * Called after modifying customer data by editing or adding.
     * dispatches action to load customer list with changes
     *
     * @returns {Promise<void>}
     */
    async refreshCustomersList() {
        try {
            const response = await this.props.dispatch(getCustomersList());
            if (!response.success) {
                throw response;
            } else {
                Toast.show({
                    text: 'Customers list successfully updated.',
                    buttonText: 'Okay',
                    type: 'success',
                });
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    }

    /**
     * Submits customer form values
     *
     * @param values
     */
    onSubmit = (values) => {
        values.addresses = [values.address_1, values.address_2, values.address_3];
        this.modifyCustomerData(values);

    };

    render() {
        const {handleSubmit, editCustomer} = this.props;
        return (
            <Container>
                {editCustomer.isLoading && <Loader/>}
                <InnerPageHeader title={'Customer'}/>
                <ScrollView padder contentContainerStyle={{flexGrow: 1}}>
                    <Card style={{paddingHorizontal: 10}}>
                        <CardItem cardBody listItemPadding>
                            <Field name={'name'}
                                   keyboardType={'default'}
                                   placeholder={'Customer Name'}
                                   icon={'ios-contact'}
                                   validate={[required]}
                                   component={renderTextInput}/>
                        </CardItem>
                        <CardItem cardBody>
                            <Field name={'email'}
                                   keyboardType={'email-address'}
                                   placeholder={'Email'}
                                   icon={'ios-mail'}
                                   validate={[email, required]}
                                   component={renderTextInput}/>
                        </CardItem>
                        <CardItem cardBody>

                            <Field name={'company'}
                                   keyboardType={'default'}
                                   placeholder={'Company'}
                                   icon={'ios-briefcase'}
                                   component={renderTextInput}/>
                        </CardItem>
                        <CardItem cardBody>
                            <Field name={'phone'}
                                   keyboardType={'phone-pad'}
                                   placeholder={'Phone'}
                                   icon={'ios-call'}
                                   validate={[phone, required]}
                                   component={renderTextInput}/>
                        </CardItem>
                        <CardItem cardBody>
                            <Field name={'mobile'}
                                   keyboardType={'phone-pad'}
                                   placeholder={'Mobile'}
                                   icon={'ios-phone-portrait'}
                                   component={renderTextInput}/>
                        </CardItem>
                    </Card>
                    <Card style={{paddingHorizontal: 10}}>
                        <CardItem cardBody>
                            <Field name={'address_1'}
                                   keyboardType={'default'}
                                   placeholder={'Address 1'}
                                   validate={[required]}
                                   component={renderTextInput}/>
                        </CardItem>
                        <CardItem cardBody>
                            <Field name={'address_2'}
                                   keyboardType={'default'}
                                   placeholder={'Address 2'}
                                   component={renderTextInput}/>
                        </CardItem>
                        <CardItem cardBody>
                            <Field name={'address_3'}
                                   keyboardType={'default'}
                                   placeholder={'Address 3'}
                                   component={renderTextInput}/>
                        </CardItem>
                    </Card>
                </ScrollView>
                <Footer>
                    <FooterTab>
                        <Button padder block primary onPress={handleSubmit(this.onSubmit)}>
                            <Text>Save</Text>
                        </Button>
                    </FooterTab>
                </Footer>
            </Container>
        );
    };
}

/**
 * Retrieves initial field values in case of editing
 * Maps props to getCustomers and editCustomer reducers
 *
 * @param state
 * @param props
 * @returns {{initialValues: *, editCustomer: editCustomer, getCustomers: getCustomers}}
 */
const mapStateToProps = (state, props) => {
    let initialValues;
    const customer = props.route?.params?.customer || props.customer;
    if (customer) {
        initialValues = {
            name: customer.name,
            company: customer.company,
            email: customer.email,
            phone: customer.phone,
            mobile: customer.mobile,
            address_1: customer.addresses && (customer.addresses)[0],
            address_2: customer.addresses && (customer.addresses)[1],
            address_3: customer.addresses && (customer.addresses)[2],
        };
    }
    return ({
        initialValues,
        editCustomer: state.customerReducer.editCustomer,
        getCustomers: state.customerReducer.getCustomers,
    });
};

const mapDispatchToProps = (dispatch) => ({
    dispatch,
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({
        form: 'customerForm',
        enableReinitialize: true,
        keepDirtyOnReinitialize: true,
        updateUnregisteredFields: true,
    }),
)(CustomerForm);
