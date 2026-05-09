import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

function replace(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

function pop() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export const Actions = {
  navigate,
  replace,
  pop,
  refresh: () => {},
  invoices: (params) => navigate('invoices', params),
  customers: (params) => navigate('customers', params),
  items: (params) => navigate('items', params),
  invoiceForm: (params) => navigate('invoiceForm', params),
  customerForm: (params) => navigate('customerForm', params),
  itemForm: (params) => navigate('itemForm', params),
  profile: (params) => navigate('profile', params),
  login: (params) => navigate('login', params),
  signup: (params) => navigate('signup', params),
  home: (params) => navigate('home', params),
};
