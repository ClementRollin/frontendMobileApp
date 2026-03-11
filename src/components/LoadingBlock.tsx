import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../constants/theme';

type Props = {
  variant?: 'list' | 'inline';
};

export const LoadingBlock = ({ variant = 'list' }: Props) => (
  <View style={[styles.container, variant === 'inline' ? styles.inline : styles.list]}>
    <ActivityIndicator size={variant === 'inline' ? 'small' : 'large'} color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    minHeight: 180,
    width: '100%',
  },
  inline: {
    minHeight: 40,
  },
});
