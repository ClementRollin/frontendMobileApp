import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  value: T;
  options: Array<Option<T>>;
  onChange: (value: T) => void;
};

export const SegmentedSelector = <T extends string>({ value, options, onChange }: Props<T>) => (
  <View style={styles.container}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Pressable
          key={option.value}
          style={[styles.item, selected && styles.itemSelected]}
          onPress={() => onChange(option.value)}
        >
          <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EAF1FB',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: 'center',
  },
  itemSelected: {
    backgroundColor: colors.card,
  },
  label: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
