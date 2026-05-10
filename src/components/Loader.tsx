/**
 * Loader component - Loading indicator overlay
 * Shows when data is being retrieved or sent
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';

interface LoaderProps {
  visible?: boolean;
  color?: string;
  size?: 'small' | 'large';
  opacity?: number;
}

/**
 * Loader - Full-screen overlay with loading spinner
 * Used during API calls and async operations
 */
const Loader: React.FC<LoaderProps> = ({
  visible = true,
  color = 'blue',
  size = 'large',
  opacity = 0.4,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: `rgba(0,0,0,${opacity})` }]}>
      <ActivityIndicator color={color} size={size} testID="loader-indicator" />
    </View>
  );
};

interface Styles {
  container: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 99,
    justifyContent: 'center',
  },
});

export default Loader;
