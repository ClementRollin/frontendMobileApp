import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export const WelcomeScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>TaskCollab</Text>
    <Text style={styles.subtitle}>Gestion de taches collaborative</Text>
    <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 15,
  },
  loader: {
    marginTop: 26,
  },
});
