import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TaskPriority } from '../types/task';

const priorityMap: Record<TaskPriority, { label: string; backgroundColor: string; textColor: string }> = {
  low: { label: 'Low', backgroundColor: '#ECFEFF', textColor: '#155E75' },
  medium: { label: 'Medium', backgroundColor: '#FEF3C7', textColor: '#92400E' },
  high: { label: 'High', backgroundColor: '#FEE2E2', textColor: '#991B1B' },
};

export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const config = priorityMap[priority];
  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.text, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
