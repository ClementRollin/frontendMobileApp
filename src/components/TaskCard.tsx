import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { Task } from '../types/task';
import { formatDateTime } from '../utils/date';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

type Props = {
  task: Task;
  onPress: () => void;
};

export const TaskCard = ({ task, onPress }: Props) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={styles.header}>
      <Text style={styles.title}>{task.title}</Text>
    </View>
    <View style={styles.badges}>
      <StatusBadge status={task.status} />
      <PriorityBadge priority={task.priority} />
    </View>
    <Text style={styles.meta}>Due: {formatDateTime(task.due_date)}</Text>
    {task.assignee ? <Text style={styles.meta}>Assigned to: {task.assignee.name}</Text> : null}
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
