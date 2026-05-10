import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, XStack } from 'tamagui';
import { navigationRef, Actions } from '../utils/NavigationService';

interface InnerPageHeaderProps {
  title: string;
}

const InnerPageHeader: React.FC<InnerPageHeaderProps> = ({ title }) => {
  const navigation = useNavigation();

  const goBack = (): void => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
      return;
    }
    Actions.home();
  };

  return (
    <XStack style={styles.header}>
      <Button chromeless onPress={goBack} accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={22} color="#0f172a" />
      </Button>
      <Text style={styles.title}>{title}</Text>
      <Button chromeless disabled opacity={0}>
        <Ionicons name="arrow-back" size={22} color="transparent" />
      </Button>
    </XStack>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
});

export default InnerPageHeader;
