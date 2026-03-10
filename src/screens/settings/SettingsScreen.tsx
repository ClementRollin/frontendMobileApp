import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';
import { useLogout } from '../../hooks/useAuth';

export const SettingsScreen = () => {
  const logoutMutation = useLogout();

  const logout = async () => {
    await logoutMutation.mutateAsync();
    Alert.alert('Session', 'You are now logged out.');
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage session and app preferences.</Text>
        <AppButton label="Logout" variant="danger" onPress={logout} loading={logoutMutation.isPending} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
