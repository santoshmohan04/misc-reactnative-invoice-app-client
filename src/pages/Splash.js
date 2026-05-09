import React, { Component } from 'react';
import {ScrollView, BackHandler, StyleSheet, View, Text} from 'react-native';
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

// Retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 2000,
  LOAD_TIMEOUT_MS: 8000,
};

/**
 * Splash component with graceful degradation
 * Attempts to load all data with retry logic
 * Falls back to partial load instead of forcing app exit
 */
class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      retryCount: 0,
      error: null,
      isLoading: true,
      loadedAssets: {
        invoices: false,
        customers: false,
        items: false,
      },
    };
    this.loadTimeoutId = null;
  }

  /**
   * Loads data with retry logic and timeout protection
   * Supports partial load to allow app to start with degraded functionality
   */
  async componentDidMount() {
    await this.attemptDataLoad();
  }

  componentWillUnmount() {
    if (this.loadTimeoutId) {
      clearTimeout(this.loadTimeoutId);
    }
  }

  attemptDataLoad = async () => {
    this.setState({ isLoading: true, error: null });

    try {
      // Set timeout to force progress even if requests hang
      const loadPromise = this.loadAllData();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Data load timeout')),
          RETRY_CONFIG.LOAD_TIMEOUT_MS
        )
      );

      await Promise.race([loadPromise, timeoutPromise]);
      
      // All data loaded successfully
      await SplashScreen.hideAsync();
      this.setState({ isLoading: false });
      Actions.replace('home');
    } catch (error) {
      await this.handleLoadError(error);
    }
  };

  loadAllData = async () => {
    const responses = await Promise.allSettled([
      this.props.dispatch(getInvoicesList()),
      this.props.dispatch(getCustomersList()),
      this.props.dispatch(getItemsList()),
    ]);

    // Track which assets loaded successfully
    const loadedAssets = {
      invoices: responses[0].status === 'fulfilled' && responses[0].value?.success,
      customers: responses[1].status === 'fulfilled' && responses[1].value?.success,
      items: responses[2].status === 'fulfilled' && responses[2].value?.success,
    };

    // Determine if we have minimum viable load (at least invoices + customers)
    const hasMinimalLoad = loadedAssets.invoices && loadedAssets.customers;
    
    if (!hasMinimalLoad) {
      const failedAssets = Object.keys(loadedAssets)
        .filter(key => !loadedAssets[key])
        .join(', ');
      throw new Error(`Failed to load: ${failedAssets}`);
    }

    this.setState({ loadedAssets });
    return responses;
  };

  handleLoadError = async (error) => {
    const { retryCount } = this.state;
    const canRetry = retryCount < RETRY_CONFIG.MAX_RETRIES;

    if (canRetry) {
      // Retry available - show retry message
      this.setState({
        error: `Loading data failed. Retrying... (${retryCount + 1}/${RETRY_CONFIG.MAX_RETRIES})`,
        retryCount: retryCount + 1,
      });

      // Wait before retrying
      await new Promise(resolve =>
        setTimeout(resolve, RETRY_CONFIG.RETRY_DELAY_MS)
      );

      // Attempt retry
      await this.attemptDataLoad();
    } else {
      // No more retries - proceed with degraded state or show error option
      const errorMsg = error?.message || 'Connection error. Please check your network.';
      
      // Allow user to proceed or retry
      this.setState({
        error: errorMsg,
        isLoading: false,
        retryCount: 0,
      });

      // Auto-proceed after showing error to allow partial functionality
      await SplashScreen.hideAsync();
      setTimeout(() => {
        Actions.replace('home');
      }, 3000);
    }
  };

  handleRetry = () => {
    this.setState({ retryCount: 0 }, () => {
      this.attemptDataLoad();
    });
  };

    render() {
    const { error, isLoading } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Logo />
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your data...</Text>
              </View>
            )}

            {error && !isLoading && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <Text style={styles.infoText}>
                  The app will start shortly with limited functionality.
                </Text>
                <Text 
                  style={styles.retryButton}
                  onPress={this.handleRetry}
                >
                  Retry Now
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
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
    loadingContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    errorContainer: {
        marginTop: 20,
        paddingHorizontal: 8,
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E74C3C',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 13,
        color: '#555555',
        lineHeight: 18,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 12,
        color: '#888888',
        fontStyle: 'italic',
        marginBottom: 16,
    },
    retryButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E90FF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        textAlign: 'center',
        marginTop: 8,
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
