import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { subscribeToToasts, type ToastMessage } from './toastSystem';

const GlobalToastHost: React.FC = () => {
  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast: ToastMessage) => {
      Alert.alert(toast.title, toast.message);
    });

    return unsubscribe;
  }, []);

  return null;
};

export default GlobalToastHost;
