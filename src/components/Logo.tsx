/**
 * Logo component - Displays app branding
 * Used on splash screen and authentication screens
 */

import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface LogoProps {
  size?: number;
  textSize?: number;
}

/**
 * Logo - App branding component with logo image and text
 */
const Logo: React.FC<LogoProps> = ({ size = 120, textSize = 22 }) => {
  return (
    <View style={styles.container}>
      <Image
        style={[styles.logo, { width: size, height: size }]}
        source={require('../assets/images/react-logo.png')}
        resizeMode="contain"
        accessibilityLabel="Invoice App Logo"
      />
      <Text style={[styles.logoText, { fontSize: textSize }]}>Invoice App</Text>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  logo: ImageStyle;
  logoText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
  },
  logoText: {
    marginVertical: 15,
    color: 'rgba(0,0,0,0.7)',
    fontWeight: '600',
  },
});

export default Logo;
