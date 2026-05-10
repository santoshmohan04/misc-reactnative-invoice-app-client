import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface EmptyListPlaceHolderProps {
  message: string;
  type?: string;
}

const EmptyListPlaceHolder: React.FC<EmptyListPlaceHolderProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.logoText}>{message}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 15,
    color: 'rgba(0,0,0,0.7)',
  },
});

export default EmptyListPlaceHolder;
