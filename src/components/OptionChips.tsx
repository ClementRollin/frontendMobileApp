import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

type Option<T extends string | number | null> = {
  label: string;
  value: T;
};

type Props<T extends string | number | null> = {
  options: Array<Option<T>>;
  value: T;
  onChange: (value: T) => void;
};

export const OptionChips = <T extends string | number | null>({ options, value, onChange }: Props<T>) => (
  <View style={styles.row}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Pressable
          key={String(option.value)}
          onPress={() => onChange(option.value)}
          style={[styles.chip, selected && styles.chipSelected]}
        >
          <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});
