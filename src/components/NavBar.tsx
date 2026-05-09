import React from 'react';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const NavBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const currentIndex = state.index;

  return (
    <View style={styles.footer}>
      <Pressable style={styles.tab} onPress={() => navigation.navigate('invoices')}>
        <FontAwesome5
          name="file-invoice-dollar"
          size={18}
          color={currentIndex === 0 ? '#2563eb' : '#64748b'}
        />
        <Text style={[styles.label, currentIndex === 0 && styles.activeLabel]}>Invoice</Text>
      </Pressable>

      <Pressable style={styles.tab} onPress={() => navigation.navigate('customers')}>
        <Ionicons
          name="people-outline"
          size={20}
          color={currentIndex === 1 ? '#2563eb' : '#64748b'}
        />
        <Text style={[styles.label, currentIndex === 1 && styles.activeLabel]}>Customers</Text>
      </Pressable>

      <Pressable style={styles.tab} onPress={() => navigation.navigate('items')}>
        <Ionicons
          name="barcode-outline"
          size={20}
          color={currentIndex === 2 ? '#2563eb' : '#64748b'}
        />
        <Text style={[styles.label, currentIndex === 2 && styles.activeLabel]}>Items</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#2563eb',
  },
});

export default NavBar;
