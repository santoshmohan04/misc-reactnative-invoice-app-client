import React, {Component} from 'react';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {Actions} from '../../utils/NavigationService';
import {registerNewUser} from '../../actions/auth.actions';
import Loader from '../../components/Loader';
import {ErrorUtils} from '../../utils/error.utils';
import {Button, Text} from 'tamagui';
import {ScrollView, StyleSheet, View} from 'react-native';
import renderTextInput from '../../components/reduxFormRenderers/RenderTextInput';
import {email, phone, required} from '../../utils/redux.form.utils';
import renderSelectOption from '../../components/reduxFormRenderers/RenderSelectOption';
import {currencies} from '../../utils/currencies.utils';
import InnerPageHeader from '../../components/InnerPageHeader';

/**
 * Sign up page componnt
 */
class SignUp extends Component<{}> {

    /**
     * dispatches action to register a new user
     *
     * @param values
     * @returns {Promise<void>}
     */
    registerNewUser = async (values) => {
        try {
            const response = await this.props.dispatch(registerNewUser(values));
            if (!response.success) {
                throw response;
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    };

    /**
     * Goes back to login page
     */
    goBack() {
        Actions.pop();
    }

    /**
     * Submits sign up form
     *
     * @param values
     */
    onSubmit = (values) => {
        console.log(values);
        this.registerNewUser(values);
    };

    render() {
        const {handleSubmit, registerUser} = this.props;
        return (
            <View style={styles.container}>
                {registerUser.isLoading && <Loader/>}
                <InnerPageHeader title={'Sign Up as Merchant'}/>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <View style={styles.cardItem}>
                            <Field name={'name'}
                                   placeholder={'Name'}
                                   keyboardType={'default'}
                                   validate={[required]}
                                   component={renderTextInput}/>
                        </View>
                        <View style={styles.cardItem}>
                            <Field name={'email'}
                                   placeholder={'Email'}
                                   keyboardType={'email-address'}
                                   validate={[email, required]}
                                   component={renderTextInput}/>
                        </View>
                        <View style={styles.cardItem}>
                            <Field name={'password'}
                                   keyboardType={'default'}
                                   placeholder={'Password'}
                                   secureTextEntry={true}
                                   validate={[required]}
                                   component={renderTextInput}/>
                        </View>
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
                            <Text style={styles.primaryButtonText}>Sign Up</Text>
                        </Button>

                        <View style={styles.inlineRow}>
                            <Text style={styles.inlineText}>Already have an account?</Text>
                            <Button chromeless onPress={() => this.goBack()}>
                                <Text style={styles.linkText}>Sign In</Text>
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
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
    primaryButtonText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    inlineText: {
        color: '#334155',
    },
    linkText: {
        color: '#2563eb',
        fontWeight: '600',
    },
});

/**
 * Adds registerUser reducer to props
 *
 * @param state
 * @returns {{registerUser: registerUser}}
 */
const mapStateToProps = (state) => ({
    registerUser: state.authReducer.registerUser,
});

const mapDispatchToProps = (dispatch) => ({
    dispatch,
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({
        form: 'register',
        enableReinitialize: true,
        keepDirtyOnReinitialize: true,
        updateUnregisteredFields: true,
    }),
)(SignUp);
