import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';
import { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Home'>;

export const AuthHomeScreen = ({ navigation }: Props) => (
  <ScreenContainer>
    <View style={styles.hero}>
      <Text style={styles.title}>TaskCollab</Text>
      <Text style={styles.subtitle}>Gestion SaaS des tâches et équipes techniques.</Text>
    </View>

    <View style={styles.actions}>
      <AppButton label="Se connecter" onPress={() => navigation.navigate('Login')} />
      <AppButton label="S'inscrire par invitation" variant="secondary" onPress={() => navigation.navigate('Register')} />
      <AppButton label="Première inscription CTO" variant="secondary" onPress={() => navigation.navigate('RegisterCto')} />
    </View>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  hero: {
    marginTop: 42,
    gap: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    marginTop: 28,
    gap: 12,
  },
});
