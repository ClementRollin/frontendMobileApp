import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

export const ErrorState = ({ message }: { message: string }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Erreur</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    padding: 16,
    gap: 6,
  },
  title: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  message: {
    color: '#7F1D1D',
    fontSize: 13,
  },
});
