import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TaskStatus } from '../types/task';

const statusMap: Record<TaskStatus, { label: string; backgroundColor: string; textColor: string }> = {
  todo: { label: 'A faire', backgroundColor: '#E2E8F0', textColor: '#334155' },
  in_progress: { label: 'En cours', backgroundColor: '#DBEAFE', textColor: '#1D4ED8' },
  done: { label: 'Terminee', backgroundColor: '#DCFCE7', textColor: '#166534' },
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const config = statusMap[status];
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
