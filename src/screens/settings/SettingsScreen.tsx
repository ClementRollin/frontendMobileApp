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
    Alert.alert('Session', 'Vous etes maintenant deconnecte.');
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Parametres</Text>
        <Text style={styles.subtitle}>Gerez votre session et les preferences de l'application.</Text>
        <AppButton label="Se deconnecter" variant="danger" onPress={logout} loading={logoutMutation.isPending} />
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
