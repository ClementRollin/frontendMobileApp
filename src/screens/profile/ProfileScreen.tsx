import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { ScreenContainer } from '../../components/ScreenContainer';
import { roleLabelFr } from '../../constants/labels';
import { colors } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { formatDateTime } from '../../utils/date';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <ScreenContainer>
        <EmptyState title="Aucun profil chargé" subtitle="Reconnectez-vous." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.row}>Nom: {user.name}</Text>
        <Text style={styles.row}>Email: {user.email}</Text>
        <Text style={styles.row}>Rôle: {roleLabelFr[user.role]}</Text>
        <Text style={styles.row}>Organisation: #{user.organization_id}</Text>
        <Text style={styles.row}>Créé le: {formatDateTime(user.created_at)}</Text>
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
    gap: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  row: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
