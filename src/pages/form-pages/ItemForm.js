import React, {Component} from 'react';
import {Actions} from '../../utils/NavigationService';
import {Button, Text} from 'tamagui';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import renderTextInput from '../../components/reduxFormRenderers/RenderTextInput';
import {Field, reduxForm} from 'redux-form';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {formatCurrency, normalizeCurrency, number, required} from '../../utils/redux.form.utils';
import {ErrorUtils} from '../../utils/error.utils';
import {editItem, getItemsList} from '../../actions/item.actions';
import Loader from '../../components/Loader';
import {getCurrency} from '../../utils/currencies.utils';
import InnerPageHeader from '../../components/InnerPageHeader';

/**
 * Form component for adding a new item or editing an existing one
 */
class ItemForm extends Component<{}> {

    /**
     * Dispatches an action to edit or add item
     * alerts on error and refreshes list on success
     *
     * @param values
     * @returns {Promise<void>}
     */
    modifyItemData = async (values) => {
        try {
            const response = await this.props.dispatch(editItem(values));
            if (!response.success) {
                throw response;
            } else {
                await this.refreshItemsList();
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    };

    /**
     * Called after modifying item data by editing or adding.
     * dispatches action to load items list with changes
     *
     * @returns {Promise<void>}
     */
    async refreshItemsList() {
        try {
            const response = await this.props.dispatch(getItemsList());
            if (!response.success) {
                throw response;
            } else {
                Alert.alert('Success', 'Items list successfully updated.');
            }
        } catch (e) {
            const newError = new ErrorUtils(e);
            newError.showAlert();
        }
    }

    /**
     * Submits item form values
     *
     * @param values
     */
    onSubmit = (values) => {
        this.modifyItemData(values);
    };

    render() {
        const {handleSubmit, editItem, getUser: {userDetails}} = this.props;
        const currency = getCurrency(userDetails.base_currency);
        return (
            <View style={styles.container}>
                {editItem.isLoading && <Loader/>}
                <InnerPageHeader title={'Item'}/>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <View style={styles.cardItem}>
                            <Field name={'name'}
                                   keyboardType={'default'}
                                   placeholder={'Item Name'}
                                   icon={'ios-barcode'}
                                   validate={[required]}
                                   component={renderTextInput}/>
                        </View>
                        <View style={styles.cardItem}>
                            <Field name={'price'}
                                   keyboardType={'decimal-pad'}
                                   placeholder={'Unit Price'}
                                   valdiate={[number, required]}
                                   icon={'ios-pricetag'}
                                   format={value => (formatCurrency(value, currency))}
                                   normalize={value => (normalizeCurrency(value))}
                                   component={renderTextInput}/>
                        </View>
                        <View style={styles.cardItem}>
                            <Field name={'description'}
                                   keyboardType={'default'}
                                   placeholder={'Description'}
                                   icon={'ios-paper'}
                                   multiline
                                   component={renderTextInput}/>
                        </View>
                    </View>
                    <View style={styles.bottomSpacer}/>
                </ScrollView>
                <View style={styles.footer}>
                    <Button style={styles.saveButton} onPress={handleSubmit(this.onSubmit)}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </Button>
                </View>
            </View>
        );
    };

    goBack() {
        Actions.pop();
        Actions.refresh();
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 12,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
    cardItem: {
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
        padding: 10,
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    bottomSpacer: {
        height: 8,
    },
});

/**
 * Retrieves initial field values in case of editing
 * Maps props to getItems and editItem reducers
 *
 * @param state
 * @param props
 * @returns {{initialValues: *, getItems: getItems, editItem: editItem, getUser: getUser}}
 */
const mapStateToProps = (state, props) => {
    let initialValues;
    const item = props.route?.params?.item || props.item;
    if (item) {
        initialValues = {
            name: item.name,
            price: item.price.toString(),
            description: item.description,
        };
    }
    return ({
        initialValues,
        getUser: state.userReducer.getUser,
        editItem: state.itemReducer.editItem,
        getItems: state.itemReducer.getItems,
    });
};

const mapDispatchToProps = (dispatch) => ({
    dispatch,
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({
        form: 'itemForm',
        enableReinitialize: true,
        keepDirtyOnReinitialize: true,
        updateUnregisteredFields: true,
    }),
)(ItemForm);
