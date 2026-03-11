import React, { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingBlock } from '../../components/LoadingBlock';
import { OptionChips } from '../../components/OptionChips';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TaskCard } from '../../components/TaskCard';
import { emptyStateLabels, roleLabelFr, statusLabelFr } from '../../constants/labels';
import { taskPriorityOptions, taskScopeOptions, taskStatusOptions } from '../../constants/taskOptions';
import { colors } from '../../constants/theme';
import { useTags } from '../../hooks/useTags';
import { useTasks } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { useUsers } from '../../hooks/useUsers';
import { useAuthStore } from '../../store/authStore';
import { MainStackParamList } from '../../types/navigation';
import { TaskFilters, TaskScope, TaskStatus } from '../../types/task';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

type ViewMode = 'list' | 'kanban';

const leadScopeOptions = taskScopeOptions;

const buildEmptyState = (role: string, scope: TaskScope) => {
  if (role === 'developer') {
    return emptyStateLabels.developerList;
  }
  if (role === 'lead_dev' && scope === 'unassigned') {
    return emptyStateLabels.leadUnassigned;
  }
  if (role === 'lead_dev') {
    return emptyStateLabels.leadList;
  }
  if (role === 'cto') {
    return emptyStateLabels.ctoList;
  }
  return emptyStateLabels.poList;
};

export const TaskListScreen = ({ navigation }: Props) => {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const teamsQuery = useTeams();
  const usersQuery = useUsers();
  const tagsQuery = useTags();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [scope, setScope] = useState<TaskScope>('visible');
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [teamId, setTeamId] = useState<number | undefined>(undefined);
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [dueBefore, setDueBefore] = useState('');
  const [dueAfter, setDueAfter] = useState('');

  const forcedScope = useMemo(() => {
    if (role === 'developer') {
      return 'assigned' as TaskScope;
    }
    return scope;
  }, [role, scope]);

  const filters: TaskFilters = {
    scope: role === 'po' || role === 'cto' ? 'visible' : forcedScope,
    status,
    priority,
    team_id: teamId,
    assignee_id: assigneeId,
    due_before: dueBefore.trim() || undefined,
    due_after: dueAfter.trim() || undefined,
    tag_ids: selectedTagId ? [selectedTagId] : undefined,
    search,
    page: 1,
    per_page: 15,
  };

  const tasksQuery = useTasks(filters);
  const tasks = tasksQuery.data?.tasks ?? [];

  const statusesForKanban: TaskStatus[] = [
    'todo',
    'in_progress',
    'blocked',
    'in_review',
    'waiting_for_test',
    'tested',
    'deployed',
  ];

  const grouped = useMemo(
    () =>
      statusesForKanban.map((statusValue) => ({
        status: statusValue,
        title: statusLabelFr[statusValue],
        tasks: tasks.filter((task) => task.status === statusValue),
      })),
    [tasks],
  );

  const isLead = role === 'lead_dev';
  const isCto = role === 'cto';
  const canManageInvitations = isLead || isCto;

  const header = (
    <View style={styles.headerContent}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>TABLEAU DE BORD</Text>
        <Text style={styles.heroTitle}>Bonjour {user?.first_name ?? user?.name ?? 'Utilisateur'}</Text>
        <Text style={styles.heroSubtitle}>Rôle: {role ? roleLabelFr[role] : '-'}</Text>
      </View>

      <View style={styles.quickActions}>
        {isLead ? (
          <Pressable style={styles.quickActionPrimary} onPress={() => navigation.navigate('TaskCreate')}>
            <Text style={styles.quickActionPrimaryLabel}>Tâches</Text>
            <Text style={styles.quickActionPrimaryValue}>+ Créer</Text>
          </Pressable>
        ) : (
          <View style={styles.quickActionPrimary}>
            <Text style={styles.quickActionPrimaryLabel}>Tâches</Text>
            <Text style={styles.quickActionPrimaryValue}>Lecture</Text>
          </View>
        )}
        <View style={styles.quickActionRight}>
          {isLead ? (
            <Pressable style={styles.quickActionSecondary} onPress={() => navigation.navigate('TagManagement')}>
              <Text style={styles.quickActionSecondaryLabel}>Tags</Text>
            </Pressable>
          ) : null}
          {canManageInvitations ? (
            <Pressable style={styles.quickActionSecondary} onPress={() => navigation.navigate('InvitationManagement')}>
              <Text style={styles.quickActionSecondaryLabel}>Invitations</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.quickActionSecondary} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.quickActionSecondaryLabel}>Profil</Text>
          </Pressable>
          <Pressable style={styles.quickActionSecondary} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.quickActionSecondaryLabel}>Paramètres</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>Filtres</Text>
        {isLead ? (
          <OptionChips options={leadScopeOptions} value={scope} onChange={(value) => setScope(value as TaskScope)} />
        ) : null}
        {!isLead ? (
          <Text style={styles.hint}>Scope: {role === 'developer' ? 'Assignées à moi' : 'Visibles'}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder="Recherche titre/description"
          value={search}
          onChangeText={setSearch}
        />
        <OptionChips
          options={[{ label: 'Tous statuts', value: 'all' as const }, ...taskStatusOptions]}
          value={status ?? 'all'}
          onChange={(value) => setStatus(value === 'all' ? undefined : (value as TaskStatus))}
        />
        <OptionChips
          options={[{ label: 'Toutes priorités', value: 'all' as const }, ...taskPriorityOptions]}
          value={priority ?? 'all'}
          onChange={(value) => setPriority(value === 'all' ? undefined : (value as 'low' | 'medium' | 'high'))}
        />
        <OptionChips
          options={[
            { label: 'Toutes équipes', value: 0 as number },
            ...(teamsQuery.data ?? []).map((team) => ({ label: team.name, value: team.id })),
          ]}
          value={teamId ?? 0}
          onChange={(value) => setTeamId(value === 0 ? undefined : (value as number))}
        />
        <OptionChips
          options={[
            { label: 'Tous assignés', value: 0 as number },
            ...(usersQuery.data ?? []).map((nextUser) => ({ label: nextUser.name, value: nextUser.id })),
          ]}
          value={assigneeId ?? 0}
          onChange={(value) => setAssigneeId(value === 0 ? undefined : (value as number))}
        />
        <OptionChips
          options={[
            { label: 'Tous tags', value: 0 as number },
            ...(tagsQuery.data ?? []).map((tag) => ({ label: tag.name, value: tag.id })),
          ]}
          value={selectedTagId ?? 0}
          onChange={(value) => setSelectedTagId(value === 0 ? undefined : (value as number))}
        />
        <TextInput
          style={styles.input}
          placeholder="Échéance avant (ISO 8601)"
          value={dueBefore}
          onChangeText={setDueBefore}
        />
        <TextInput
          style={styles.input}
          placeholder="Échéance après (ISO 8601)"
          value={dueAfter}
          onChangeText={setDueAfter}
        />
      </View>

      {isLead && forcedScope === 'visible' ? (
        <View style={styles.viewSwitch}>
          <OptionChips
            options={[
              { label: 'Liste', value: 'list' as ViewMode },
              { label: 'Kanban léger', value: 'kanban' as ViewMode },
            ]}
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
          />
        </View>
      ) : null}

      {tasksQuery.data?.fromCache ? <Text style={styles.cacheBanner}>{tasksQuery.data.cacheMessage}</Text> : null}
    </View>
  );

  const empty = buildEmptyState(role ?? 'developer', forcedScope);

  if (tasksQuery.isLoading && !tasks.length) {
    return (
      <ScreenContainer>
        <LoadingBlock />
      </ScreenContainer>
    );
  }

  if (tasksQuery.isError && !tasks.length) {
    return (
      <ScreenContainer>
        <ErrorState message={getErrorMessage(tasksQuery.error)} />
      </ScreenContainer>
    );
  }

  if (isLead && forcedScope === 'visible' && viewMode === 'kanban') {
    return (
      <ScreenContainer>
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.status}
          ListHeaderComponent={header}
          refreshControl={<RefreshControl refreshing={tasksQuery.isRefetching} onRefresh={() => tasksQuery.refetch()} />}
          renderItem={({ item }) => (
            <View style={styles.column}>
              <Text style={styles.columnTitle}>{item.title}</Text>
              {item.tasks.length === 0 ? (
                <View style={styles.columnEmpty}>
                  <Text style={styles.columnEmptyText}>Aucune tâche</Text>
                </View>
              ) : (
                item.tasks.map((task) => (
                  <View key={task.id} style={styles.columnCard}>
                    <TaskCard task={task} onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })} />
                  </View>
                ))
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TaskCard task={item} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })} />}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState title={empty.title} subtitle={empty.subtitle} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={tasksQuery.isRefetching} onRefresh={() => tasksQuery.refetch()} />}
      />
      {isCto ? <Text style={styles.ctoReadOnly}>Mode lecture seule activé (CTO)</Text> : null}
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
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: colors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  viewSwitch: {
    gap: 8,
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
  listContent: {
    paddingBottom: 32,
    gap: 12,
  },
  column: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 14,
    padding: 10,
    gap: 8,
  },
  columnTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  columnEmpty: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  columnEmptyText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  columnCard: {
    marginBottom: 8,
  },
  ctoReadOnly: {
    textAlign: 'center',
    color: '#92400E',
    fontWeight: '700',
    paddingBottom: 4,
  },
});
