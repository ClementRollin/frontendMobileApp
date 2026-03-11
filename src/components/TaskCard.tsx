import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { statusLabelFr } from '../constants/labels';
import { colors } from '../constants/theme';
import { Task } from '../types/task';
import { formatDateTime } from '../utils/date';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

type Props = {
  task: Task;
  onPress: () => void;
};

const getPriorityStripeColor = (priority: Task['priority']) => {
  if (priority === 'high') {
    return '#FCA5A5';
  }

  if (priority === 'medium') {
    return '#FCD34D';
  }

  return '#7DD3FC';
};

export const TaskCard = ({ task, onPress }: Props) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={[styles.priorityStripe, { backgroundColor: getPriorityStripeColor(task.priority) }]} />

    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>
      <Text style={styles.chevron}>{'>'}</Text>
    </View>

    <View style={styles.badges}>
      <StatusBadge status={task.status} />
      <PriorityBadge priority={task.priority} />
    </View>

    <View style={styles.metaBlock}>
      <Text style={styles.metaLabel}>Échéance</Text>
      <Text style={styles.metaValue}>{formatDateTime(task.due_date)}</Text>
    </View>

    <View style={styles.metaBlock}>
      <Text style={styles.metaLabel}>Assignée à</Text>
      <Text style={styles.metaValue}>{task.assignee?.name ?? 'Non assignée'}</Text>
    </View>

    {task.team ? (
      <View style={styles.metaBlock}>
        <Text style={styles.metaLabel}>Équipe</Text>
        <Text style={styles.metaValue}>{task.team.name}</Text>
      </View>
    ) : null}

    {task.status === 'blocked' && task.blocked_reason ? (
      <View style={styles.metaBlock}>
        <Text style={styles.metaLabel}>{statusLabelFr.blocked}</Text>
        <Text style={styles.metaValue} numberOfLines={2}>
          {task.blocked_reason}
        </Text>
      </View>
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
    overflow: 'hidden',
  },
  priorityStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  chevron: {
    color: '#94A3B8',
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBlock: {
    gap: 2,
  },
  metaLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
