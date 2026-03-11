import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

type Option = {
  label: string;
  value: number;
};

type Props = {
  options: Option[];
  values: number[];
  onChange: (nextValues: number[]) => void;
};

export const MultiOptionChips = ({ options, values, onChange }: Props) => (
  <View style={styles.row}>
    {options.map((option) => {
      const selected = values.includes(option.value);
      return (
        <Pressable
          key={String(option.value)}
          onPress={() => {
            if (selected) {
              onChange(values.filter((value) => value !== option.value));
            } else {
              onChange([...values, option.value]);
            }
          }}
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
