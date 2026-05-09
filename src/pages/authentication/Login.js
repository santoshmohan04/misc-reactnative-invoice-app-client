import React, {Component} from 'react';
import {Button, Text} from 'tamagui';
import {ScrollView, StyleSheet, View} from 'react-native';

import {Actions} from '../../utils/NavigationService';
import Logo from '../../components/Logo';
import {Field, reduxForm} from 'redux-form';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {loginUser} from '../../actions/auth.actions';
import Loader from '../../components/Loader';
import {ErrorUtils} from '../../utils/error.utils';
import renderTextInput from '../../components/reduxFormRenderers/RenderTextInput';
import {email, required} from '../../utils/redux.form.utils';

/**
 * Login page
 */
class Login extends Component<{}> {
    /**
     * Dispatches an action to login user and alerts on error
     *
     * @param values
     * @returns {Promise<void>}
     */
    loginUser = async (values) => {
        try {
            const response = await this.props.dispatch(loginUser(values));
            if (!response.success) {
                throw response;
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    };

    /**
     * Opens registration page
     */
    openSignUp() {
        Actions.signup();
    }

    /**
     * Submits login form values
     *
     * @param values
     */
    onSubmit = (values) => {
        this.loginUser(values);
    };

    render() {
        const {handleSubmit, loginUser} = this.props;
        return (
            <View style={styles.container}>
                {loginUser.isLoading && <Loader/>}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Logo/>
                    <View style={styles.card}>
                        <View style={styles.cardItem}>
                                <Field name={'email'}
                                       keyboardType={'email-address'}
                                       placeholder={'Email'}
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

                        <Button style={styles.primaryButton} onPress={handleSubmit(this.onSubmit)}>
                            <Text style={styles.primaryButtonText}>Login</Text>
                        </Button>

                        <View style={styles.inlineRow}>
                            <Text style={styles.inlineText}>Don&apos;t have an account yet?</Text>
                            <Button chromeless onPress={() => this.openSignUp()}>
                                <Text style={styles.linkText}>Sign Up</Text>
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
 * maps loginUser reducer to props
 *
 * @param state
 * @returns {{loginUser: (Login.loginUser|loginUser)}}
 */
const mapStateToProps = (state) => ({
    loginUser: state.authReducer.loginUser,
});

const mapDispatchToProps = (dispatch) => ({
    dispatch,
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({
        form: 'login',
        enableReinitialize: true,
        keepDirtyOnReinitialize: true,
        updateUnregisteredFields: true,
    }),
)(Login);
