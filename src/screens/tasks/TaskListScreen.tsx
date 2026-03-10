import React, { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingBlock } from '../../components/LoadingBlock';
import { OptionChips } from '../../components/OptionChips';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SegmentedSelector } from '../../components/SegmentedSelector';
import { TaskCard } from '../../components/TaskCard';
import { taskScopeOptions } from '../../constants/taskOptions';
import { colors } from '../../constants/theme';
import { useTasks } from '../../hooks/useTasks';
import { MainStackParamList } from '../../types/navigation';
import { TaskScope, TaskStatus } from '../../types/task';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

const statusOptions = [
  { label: 'All', value: 'all' as const },
  { label: 'To do', value: 'todo' as const },
  { label: 'In progress', value: 'in_progress' as const },
  { label: 'Done', value: 'done' as const },
];

export const TaskListScreen = ({ navigation }: Props) => {
  const [scope, setScope] = useState<TaskScope>('visible');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  const status = statusFilter === 'all' ? undefined : statusFilter;
  const tasksQuery = useTasks(scope, status);

  const tasks = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data?.tasks]);
  const isLoading = tasksQuery.isLoading;
  const isError = tasksQuery.isError && tasks.length === 0;

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingBlock />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer>
        <ErrorState message={getErrorMessage(tasksQuery.error)} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.headerActions}>
        <Pressable style={styles.headerButton} onPress={() => navigation.navigate('TaskCreate')}>
          <Text style={styles.headerButtonText}>+ Task</Text>
        </Pressable>
        <Pressable style={styles.headerButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.headerButtonText}>Profile</Text>
        </Pressable>
        <Pressable style={styles.headerButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.headerButtonText}>Settings</Text>
        </Pressable>
      </View>

      <SegmentedSelector value={scope} options={taskScopeOptions} onChange={setScope} />

      <OptionChips
        options={statusOptions}
        value={statusFilter}
        onChange={(value) => setStatusFilter(value as 'all' | TaskStatus)}
      />

      {tasksQuery.data?.fromCache ? <Text style={styles.cacheBanner}>{tasksQuery.data.cacheMessage}</Text> : null}

      <FlatList
        style={styles.list}
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TaskCard task={item} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={tasksQuery.isRefetching} onRefresh={() => tasksQuery.refetch()} />}
        ListEmptyComponent={<EmptyState title="No tasks found" subtitle="Create a task or change filters." />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  headerButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  cacheBanner: {
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 22,
    gap: 10,
  },
  list: {
    flex: 1,
  },
});
