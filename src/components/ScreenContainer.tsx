import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';

type Props = PropsWithChildren<{
  scrollable?: boolean;
  contentStyle?: ViewStyle;
}>;

export const ScreenContainer = ({ children, scrollable = false, contentStyle }: Props) => {
  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={[styles.scrollContent, contentStyle]}>{children}</ScrollView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={[styles.safeArea, contentStyle]}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
});
