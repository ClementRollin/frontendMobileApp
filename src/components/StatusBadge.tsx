import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { statusLabelFr } from '../constants/labels';
import { TaskStatus } from '../types/task';

const statusMap: Record<TaskStatus, { label: string; backgroundColor: string; textColor: string }> = {
  todo: { label: statusLabelFr.todo, backgroundColor: '#E2E8F0', textColor: '#334155' },
  in_progress: { label: statusLabelFr.in_progress, backgroundColor: '#DBEAFE', textColor: '#1D4ED8' },
  blocked: { label: statusLabelFr.blocked, backgroundColor: '#FEE2E2', textColor: '#B91C1C' },
  in_review: { label: statusLabelFr.in_review, backgroundColor: '#EDE9FE', textColor: '#6D28D9' },
  waiting_for_test: { label: statusLabelFr.waiting_for_test, backgroundColor: '#FEF3C7', textColor: '#92400E' },
  tested: { label: statusLabelFr.tested, backgroundColor: '#DCFCE7', textColor: '#166534' },
  deployed: { label: statusLabelFr.deployed, backgroundColor: '#D1FAE5', textColor: '#065F46' },
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
