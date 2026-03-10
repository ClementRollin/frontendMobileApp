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
import { useAuthStore } from '../../store/authStore';
import { MainStackParamList } from '../../types/navigation';
import { TaskScope, TaskStatus } from '../../types/task';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

const statusOptions = [
  { label: 'Toutes', value: 'all' as const },
  { label: 'A faire', value: 'todo' as const },
  { label: 'En cours', value: 'in_progress' as const },
  { label: 'Terminees', value: 'done' as const },
];

export const TaskListScreen = ({ navigation }: Props) => {
  const [scope, setScope] = useState<TaskScope>('visible');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const user = useAuthStore((state) => state.user);

  const status = statusFilter === 'all' ? undefined : statusFilter;
  const tasksQuery = useTasks(scope, status);

  const tasks = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data?.tasks]);
  const taskStats = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === 'todo').length,
      inProgress: tasks.filter((task) => task.status === 'in_progress').length,
      done: tasks.filter((task) => task.status === 'done').length,
    }),
    [tasks],
  );
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

  const lastSyncLabel = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const listHeader = (
    <View style={styles.headerContent}>
      <View style={styles.heroCard}>
        <View style={styles.heroBlobTop} />
        <View style={styles.heroBlobBottom} />
        <Text style={styles.heroEyebrow}>TABLEAU DE BORD</Text>
        <Text style={styles.heroTitle}>Bonjour {user?.name ?? 'utilisateur'}</Text>
        <Text style={styles.heroSubtitle}>Pilotez vos taches collaboratives de facon claire et rapide.</Text>
        <Text style={styles.heroMeta}>Derniere synchronisation: {lastSyncLabel}</Text>
      </View>

      <View style={styles.quickActions}>
        <Pressable style={styles.quickActionPrimary} onPress={() => navigation.navigate('TaskCreate')}>
          <Text style={styles.quickActionPrimaryLabel}>Nouvelle tache</Text>
          <Text style={styles.quickActionPrimaryValue}>+ Ajouter</Text>
        </Pressable>
        <View style={styles.quickActionRight}>
          <Pressable style={styles.quickActionSecondary} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.quickActionSecondaryLabel}>Profil</Text>
          </Pressable>
          <Pressable style={styles.quickActionSecondary} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.quickActionSecondaryLabel}>Parametres</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{taskStats.todo}</Text>
          <Text style={styles.kpiLabel}>A faire</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{taskStats.inProgress}</Text>
          <Text style={styles.kpiLabel}>En cours</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{taskStats.done}</Text>
          <Text style={styles.kpiLabel}>Terminees</Text>
        </View>
      </View>

      <View style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>Filtres</Text>
        <SegmentedSelector value={scope} options={taskScopeOptions} onChange={setScope} />
        <OptionChips
          options={statusOptions}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as 'all' | TaskStatus)}
        />
      </View>

      {tasksQuery.data?.fromCache ? <Text style={styles.cacheBanner}>{tasksQuery.data.cacheMessage}</Text> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes taches</Text>
        <Text style={styles.sectionCount}>{tasks.length} element(s)</Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        style={styles.list}
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TaskCard task={item} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })} />}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={tasksQuery.isRefetching} onRefresh={() => tasksQuery.refetch()} />}
        ListEmptyComponent={<EmptyState title="Aucune tache trouvee" subtitle="Creez une tache ou changez les filtres." />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    gap: 14,
    marginBottom: 12,
  },
  heroCard: {
    backgroundColor: '#102A43',
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
  },
  heroBlobTop: {
    position: 'absolute',
    right: -28,
    top: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1F5FAE',
    opacity: 0.45,
  },
  heroBlobBottom: {
    position: 'absolute',
    left: -34,
    bottom: -42,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#1D4ED8',
    opacity: 0.35,
  },
  heroEyebrow: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  heroSubtitle: {
    color: '#DBEAFE',
    marginTop: 6,
    lineHeight: 20,
    fontSize: 14,
    maxWidth: '92%',
  },
  heroMeta: {
    color: '#93C5FD',
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionPrimary: {
    flex: 1.35,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 3,
  },
  quickActionPrimaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionPrimaryValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  quickActionRight: {
    flex: 1,
    gap: 10,
  },
  quickActionSecondary: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  quickActionSecondaryLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 3,
  },
  kpiValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  kpiLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  filtersTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  cacheBanner: {
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCount: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 32,
    gap: 12,
  },
  list: {
    flex: 1,
  },
});
