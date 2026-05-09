import React, {Component} from 'react';
import {Button, Text} from 'tamagui';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {Field, reduxForm} from 'redux-form';
import renderTextInput from '../components/reduxFormRenderers/RenderTextInput';
import {phone, required} from '../utils/redux.form.utils';
import {currencies} from '../utils/currencies.utils';
import renderSelectOption from '../components/reduxFormRenderers/RenderSelectOption';
import {compose} from 'redux';
import {connect} from 'react-redux';
import InnerPageHeader from '../components/InnerPageHeader';
import {editUser, getUser, logoutUser} from '../actions/auth.actions';
import {ErrorUtils} from '../utils/error.utils';
import Loader from '../components/Loader';

/**
 * Profile component to edit user data or logout
 */
class Profile extends Component<{}> {
    /**
     * dispatches action to edit user data
     * refreshes user data on success and alerts on fail
     *
     * @param values
     * @returns {Promise<void>}
     */
    onSubmit = async (values) => {
        try {
            const response = await this.props.dispatch(editUser(values));
            if (response.success) {
                await this.refreshUserData();
            } else {
                throw response;
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    };

    /**
     * Called after modifying user data.
     * dispatches action to load new user data
     *
     * @returns {Promise<void>}
     */
    async refreshUserData() {
        try {
            const response = await this.props.dispatch(getUser());
            if (!response.success) {
                throw response;
            } else {
                Alert.alert('Success', 'Profile successfully updated.');
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    }

    /**
     * Dispatches action to logout user
     */
    logoutUser = () => {
        this.props.dispatch(logoutUser());
    };

    render() {
        const {handleSubmit, editUser} = this.props;
        return (
            <View style={styles.container}>
                {editUser.isLoading && <Loader/>}
                <InnerPageHeader title={'Profile'}/>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <View style={styles.cardItem}>
                            <Field name={'company'}
                                   keyboardType={'default'}
                                   placeholder={'Company'}
                                   component={renderTextInput}/>
                        </View>
                        <View style={styles.cardItem}>
                            <Field name={'phone'}
                                   keyboardType={'phone-pad'}
                                   placeholder={'Phone'}
                                   validate={[required, phone]}
                                   component={renderTextInput}/>
                        </View>
                        <View style={styles.cardItem}>
                            <Field name={'address'}
                                   keyboardType={'default'}
                                   placeholder={'Address'}
                                   validate={[required]}
                                   component={renderTextInput}/>
                        </View>
                        <View style={styles.cardItem}>
                            <Field name={'base_currency'}
                                   keyboardType={'default'}
                                   placeholder={'Base Items Currency'}
                                   optionsArray={currencies}
                                   validate={[required]}
                                   placeHolder={'Select Base Currency'}
                                   component={renderSelectOption}/>
                        </View>

                        <Button style={styles.primaryButton} onPress={handleSubmit(this.onSubmit)}>
                            <Text style={styles.primaryButtonText}>Save Data</Text>
                        </Button>
                    </View>

                    <View style={styles.card}>
                        <Button style={styles.dangerButton} onPress={() => this.logoutUser()}>
                            <Text style={styles.primaryButtonText}>Logout</Text>
                        </Button>
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
        paddingVertical: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        padding: 12,
        marginBottom: 10,
    },
    cardItem: {
        marginBottom: 4,
    },
    primaryButton: {
        marginTop: 8,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dangerButton: {
        backgroundColor: '#dc2626',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontWeight: '700',
    },
});


/**
 * maps props to user reducer to get initial user data
 * maps props to edit user reducer to show loader on edit user request
 * sets up initial form values
 *
 * @param state
 * @returns {{initialValues: {base_currency: *, address: string | (() => (AddressInfo | string)) | (() => (AddressInfo | string | null)) | (() => AddressInfo), phone: string, company: *}, getUser: getUser, editUser: editUser}}
 */
const mapStateToProps = (state) => ({
    getUser: state.userReducer.getUser,
    editUser: state.userReducer.editUser,
    initialValues: {
        company: state.userReducer.getUser.userDetails.company,
        phone: state.userReducer.getUser.userDetails.phone,
        address: state.userReducer.getUser.userDetails.address,
        base_currency: state.userReducer.getUser.userDetails.base_currency,
    },
});

const mapDispatchToProps = (dispatch) => ({
    dispatch,
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({
        form: 'editUser',
        enableReinitialize: true,
        keepDirtyOnReinitialize: true,
        updateUnregisteredFields: true,
    }),
)(Profile);
