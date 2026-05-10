/**
 * RehydrationLoader - Shows during Redux persist rehydration
 * Prevents flashing login screen while persisted auth state loads
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Logo from '../components/Logo';

const RehydrationLoader: React.FC = () => {
  return (
    <View style={styles.container}>
      <Logo />
      <ActivityIndicator size="large" color="#2196F3" style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c313a',
  },
  spinner: {
    marginTop: 20,
  },
});

export default RehydrationLoader;
