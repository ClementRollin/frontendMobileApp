import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { commonLabels } from '../../constants/labels';
import { colors } from '../../constants/theme';
import { MainStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<MainStackParamList, 'AccessDenied'>;

export const AccessDeniedScreen = ({ navigation }: Props) => (
  <ScreenContainer>
    <View style={styles.card}>
      <Text style={styles.title}>{commonLabels.unauthorizedTitle}</Text>
      <Text style={styles.subtitle}>{commonLabels.unauthorizedSubtitle}</Text>
      <AppButton label={commonLabels.back} variant="secondary" onPress={() => navigation.goBack()} />
    </View>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
