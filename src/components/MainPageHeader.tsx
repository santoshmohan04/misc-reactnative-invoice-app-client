/**
 * Header component for main pages.
 * Contains a profile button and a refresh button that reloads all data.
 * Converted to RTK Query for modern async state management.
 */

import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text, XStack } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import {
  useGetInvoicesQuery,
  useGetCustomersQuery,
  useGetItemsQuery,
} from '../store/apis/dataApi';
import { useGetCurrentUserQuery } from '../store/apis/authApi';
import { handleApiError, showSuccessToast } from '../shared/errors/apiErrorHandler';
import { useAuthToken } from '../store/hooks';

interface MainPageHeaderProps {
  title?: string;
}

/**
 * Header component with RTK Query integration
 * Provides profile navigation and manual data refresh
 */
const MainPageHeader: React.FC<MainPageHeaderProps> = ({ title = '' }) => {
  const navigation = useNavigation();
  const token = useAuthToken();

  // RTK Query hooks for data
  const invoicesQuery = useGetInvoicesQuery();
  const customersQuery = useGetCustomersQuery();
  const itemsQuery = useGetItemsQuery();
  const userQuery = useGetCurrentUserQuery(undefined, { skip: !token });

  /**
   * Manually trigger refetch of all queries
   * Shows success/error feedback to user
   */
  const handleRefresh = async () => {
    try {
      // Trigger refetch for all queries
      const results = await Promise.all([
        token ? userQuery.refetch() : Promise.resolve({} as any),
        invoicesQuery.refetch(),
        customersQuery.refetch(),
        itemsQuery.refetch(),
      ]);

      // Check if all queries succeeded
      const allSuccess = results.every((result) => !result.error);

      if (allSuccess) {
        showSuccessToast('Data was successfully updated.');
      } else {
        handleApiError(new Error('Failed to update some data'), 'MainPageHeader.refresh');
      }
    } catch (error) {
      handleApiError(error, 'MainPageHeader.refresh');
    }
  };

  const handleNavigateToProfile = () => {
    navigation.navigate('profile' as never);
  };

  const isRefreshing =
    invoicesQuery.isFetching ||
    customersQuery.isFetching ||
    itemsQuery.isFetching ||
    userQuery.isFetching;

  return (
    <XStack style={styles.header}>
      <Button
        chromeless
        onPress={handleNavigateToProfile}
        aria-label="Navigate to profile"
      >
        <Ionicons name="person-outline" size={22} color="#0f172a" />
      </Button>
      <Text style={styles.title}>{title}</Text>
      <Button
        chromeless
        onPress={handleRefresh}
        disabled={isRefreshing}
        opacity={isRefreshing ? 0.5 : 1}
        aria-label="Refresh data"
      >
        <Ionicons
          name={isRefreshing ? 'hourglass' : 'refresh'}
          size={22}
          color="#0f172a"
        />
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

export default MainPageHeader;
