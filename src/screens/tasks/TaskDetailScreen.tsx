import React, { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingBlock } from '../../components/LoadingBlock';
import { OptionChips } from '../../components/OptionChips';
import { PriorityBadge } from '../../components/PriorityBadge';
import { ScreenContainer } from '../../components/ScreenContainer';
import { StatusBadge } from '../../components/StatusBadge';
import { commonLabels, emptyStateLabels, statusLabelFr } from '../../constants/labels';
import { colors } from '../../constants/theme';
import { useAddComment, useTaskComments } from '../../hooks/useComments';
import { useTaskHistories } from '../../hooks/useTaskHistories';
import { useCreateTaskLink, useDeleteTaskLink, useTaskLinks } from '../../hooks/useTaskLinks';
import { useTasks, useConfirmBlocked, useDeleteTask, usePatchTaskStatus, useTask } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/authStore';
import { MainStackParamList } from '../../types/navigation';
import { TaskStatus } from '../../types/task';
import { formatDateTime } from '../../utils/date';
import { getErrorMessage } from '../../utils/error';
import {
  canCommentTask,
  canConfirmBlocked,
  canDeleteTask,
  canEditTask,
  canManageTaskLinks,
  getAllowedTransitions,
} from '../../utils/taskRules';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskDetail'>;

export const TaskDetailScreen = ({ route, navigation }: Props) => {
  const { taskId } = route.params;
  const currentUser = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const [commentContent, setCommentContent] = useState('');
  const [blockedReason, setBlockedReason] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState<number | null>(null);
  const [linkType, setLinkType] = useState('');

  const taskQuery = useTask(taskId);
  const commentsQuery = useTaskComments(taskId);
  const historiesQuery = useTaskHistories(taskId);
  const linksQuery = useTaskLinks(taskId);
  const visibleTasksQuery = useTasks({ scope: 'visible', page: 1, per_page: 50 });

  const statusMutation = usePatchTaskStatus();
  const deleteMutation = useDeleteTask();
  const addCommentMutation = useAddComment(taskId);
  const confirmBlockedMutation = useConfirmBlocked();
  const createLinkMutation = useCreateTaskLink(taskId);
  const deleteLinkMutation = useDeleteTaskLink(taskId);

  const currentTaskId = taskQuery.data?.id ?? taskId;
  const linkableTaskOptions = useMemo(
    () =>
      (visibleTasksQuery.data?.tasks ?? [])
        .filter((candidate) => candidate.id !== currentTaskId)
        .map((candidate) => ({
          label: candidate.title,
          value: candidate.id,
        })),
    [currentTaskId, visibleTasksQuery.data?.tasks],
  );

  if (taskQuery.isLoading) {
    return (
      <ScreenContainer>
        <LoadingBlock />
      </ScreenContainer>
    );
  }

  if (taskQuery.isError || !taskQuery.data) {
    return (
      <ScreenContainer>
        <ErrorState message={getErrorMessage(taskQuery.error)} />
      </ScreenContainer>
    );
  }

  const task = taskQuery.data;
  const effectiveRole = role ?? currentUser?.role;
  if (!effectiveRole) {
    return (
      <ScreenContainer>
        <ErrorState message="Rôle utilisateur introuvable." />
      </ScreenContainer>
    );
  }

  const allowedTransitions = getAllowedTransitions(effectiveRole, task.status);
  const canEdit = canEditTask(effectiveRole);
  const canDelete = canDeleteTask(effectiveRole);
  const canComment = canCommentTask(effectiveRole);
  const canManageLinks = canManageTaskLinks(effectiveRole);
  const canConfirm = canConfirmBlocked(effectiveRole, task);

  const updateStatus = async (status: TaskStatus) => {
    if (status === 'blocked' && !blockedReason.trim()) {
      Alert.alert('Blocage', 'Un motif de blocage est obligatoire.');
      return;
    }

    await statusMutation.mutateAsync({
      taskId: task.id,
      payload: {
        status,
        blocked_reason: status === 'blocked' ? blockedReason.trim() : undefined,
      },
    });
  };

  const confirmDelete = () => {
    Alert.alert(commonLabels.confirmDeleteTaskTitle, commonLabels.confirmDeleteTaskMessage, [
      { text: commonLabels.cancel, style: 'cancel' },
      {
        text: commonLabels.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteMutation.mutateAsync(task.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const submitComment = async () => {
    if (!commentContent.trim()) {
      return;
    }

    await addCommentMutation.mutateAsync({ content: commentContent.trim() });
    setCommentContent('');
  };

  const submitLink = async () => {
    if (!linkedTaskId) {
      return;
    }
    await createLinkMutation.mutateAsync({
      linked_task_id: linkedTaskId,
      link_type: linkType.trim() || undefined,
    });
    setLinkedTaskId(null);
    setLinkType('');
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={styles.badges}>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </View>
          <Text style={styles.meta}>Échéance: {formatDateTime(task.due_date)}</Text>
          <Text style={styles.meta}>Équipe: {task.team?.name ?? '-'}</Text>
          <Text style={styles.meta}>Créateur: {task.creator?.name ?? `#${task.creator_id}`}</Text>
          <Text style={styles.meta}>Assignée à: {task.assignee?.name ?? 'Non assignée'}</Text>
          {task.blocked_reason ? <Text style={styles.meta}>Motif blocage: {task.blocked_reason}</Text> : null}
          {task.blocked_confirmed_at ? (
            <Text style={styles.meta}>Blocage confirmé le: {formatDateTime(task.blocked_confirmed_at)}</Text>
          ) : null}
          {task.deployed_at ? <Text style={styles.meta}>Déployée le: {formatDateTime(task.deployed_at)}</Text> : null}
          <Text style={styles.description}>{task.description || 'Aucune description'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tags</Text>
          {!task.tags?.length ? (
            <EmptyState title={emptyStateLabels.tags.title} subtitle={emptyStateLabels.tags.subtitle} />
          ) : (
            <View style={styles.tagsRow}>
              {task.tags.map((tag) => (
                <View key={tag.id} style={styles.tagPill}>
                  <View style={[styles.tagDot, { backgroundColor: tag.color ?? '#94A3B8' }]} />
                  <Text style={styles.tagText}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Commentaires</Text>
          {commentsQuery.isLoading ? <LoadingBlock /> : null}
          {commentsQuery.isError ? <ErrorState message={getErrorMessage(commentsQuery.error)} /> : null}
          {!commentsQuery.isLoading && !commentsQuery.data?.length ? (
            <EmptyState title={emptyStateLabels.comments.title} subtitle={emptyStateLabels.comments.subtitle} />
          ) : null}

          {commentsQuery.data?.map((comment) => (
            <View key={comment.id} style={styles.itemRow}>
              <Text style={styles.itemTitle}>{comment.user?.name ?? `Utilisateur #${comment.user_id}`}</Text>
              <Text style={styles.itemBody}>{comment.content}</Text>
              <Text style={styles.itemMeta}>{formatDateTime(comment.created_at)}</Text>
            </View>
          ))}

          {canComment ? (
            <View style={styles.commentForm}>
              <AppInput
                label="Ajouter un commentaire"
                value={commentContent}
                onChangeText={setCommentContent}
                placeholder="Votre commentaire"
              />
              <AppButton label="Envoyer" onPress={submitComment} loading={addCommentMutation.isPending} />
            </View>
          ) : (
            <Text style={styles.readOnlyText}>Lecture seule pour votre rôle.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Historique des statuts</Text>
          {historiesQuery.isLoading ? <LoadingBlock /> : null}
          {historiesQuery.isError ? <ErrorState message={getErrorMessage(historiesQuery.error)} /> : null}
          {!historiesQuery.isLoading && !historiesQuery.data?.length ? (
            <EmptyState title={emptyStateLabels.histories.title} subtitle={emptyStateLabels.histories.subtitle} />
          ) : null}

          {historiesQuery.data?.map((history) => (
            <View key={history.id} style={styles.itemRow}>
              <Text style={styles.itemTitle}>{history.user?.name ?? 'Système'}</Text>
              <Text style={styles.itemBody}>
                {(history.old_status ? statusLabelFr[history.old_status] : 'Nouveau')} {' -> '} {statusLabelFr[history.new_status]}
              </Text>
              {history.comment ? <Text style={styles.itemBody}>{history.comment}</Text> : null}
              <Text style={styles.itemMeta}>{formatDateTime(history.created_at)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tâches liées</Text>
          {linksQuery.isLoading ? <LoadingBlock /> : null}
          {linksQuery.isError ? <ErrorState message={getErrorMessage(linksQuery.error)} /> : null}
          {!linksQuery.isLoading && !linksQuery.data?.length ? (
            <EmptyState title={emptyStateLabels.links.title} subtitle={emptyStateLabels.links.subtitle} />
          ) : null}

          {linksQuery.data?.map((link) => (
            <View key={link.id} style={styles.itemRow}>
              <Text style={styles.itemTitle}>{link.linked_task?.title ?? `Lien #${link.id}`}</Text>
              {link.linked_task ? (
                <>
                  <Text style={styles.itemBody}>
                    {statusLabelFr[link.linked_task.status]} | {link.linked_task.priority}
                  </Text>
                  <Text style={styles.itemBody}>
                    Assignée à: {link.linked_task.assignee?.name ?? 'Non assignée'}
                  </Text>
                </>
              ) : null}
              {canManageLinks ? (
                <AppButton
                  label="Supprimer le lien"
                  variant="danger"
                  onPress={() => deleteLinkMutation.mutateAsync(link.id)}
                  loading={deleteLinkMutation.isPending}
                />
              ) : null}
            </View>
          ))}

          {canManageLinks ? (
            <View style={styles.commentForm}>
              <Text style={styles.formLabel}>Ajouter un lien</Text>
              <OptionChips
                options={linkableTaskOptions}
                value={linkedTaskId}
                onChange={(value) => setLinkedTaskId(value as number)}
              />
              <AppInput label="Type de lien (optionnel)" value={linkType} onChangeText={setLinkType} />
              <AppButton label="Créer le lien" onPress={submitLink} loading={createLinkMutation.isPending} />
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Actions</Text>
          {allowedTransitions.length ? (
            <View style={styles.actionsSection}>
              <Text style={styles.formLabel}>Changer le statut</Text>
              <OptionChips
                options={allowedTransitions.map((status) => ({ label: statusLabelFr[status], value: status }))}
                value={task.status}
                onChange={(value) => updateStatus(value as TaskStatus)}
              />
              {allowedTransitions.includes('blocked') ? (
                <AppInput
                  label="Motif de blocage (requis pour Bloqué)"
                  value={blockedReason}
                  onChangeText={setBlockedReason}
                  placeholder="Décrivez le blocage"
                />
              ) : null}
              {statusMutation.error ? <ErrorState message={getErrorMessage(statusMutation.error)} /> : null}
              {statusMutation.isPending ? <LoadingBlock variant="inline" /> : null}
            </View>
          ) : (
            <Text style={styles.readOnlyText}>Aucune action de transition disponible pour votre rôle.</Text>
          )}

          {canConfirm ? (
            <AppButton
              label="Confirmer le blocage"
              onPress={() => confirmBlockedMutation.mutateAsync({ taskId: task.id })}
              loading={confirmBlockedMutation.isPending}
            />
          ) : null}

          {canEdit ? (
            <AppButton label="Modifier la tâche" onPress={() => navigation.navigate('TaskEdit', { task })} />
          ) : null}

          {canDelete ? (
            <AppButton
              label={commonLabels.delete}
              variant="danger"
              onPress={confirmDelete}
              loading={deleteMutation.isPending}
            />
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  title: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  readOnlyText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
  },
  tagDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  tagText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  itemRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    gap: 3,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemBody: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commentForm: {
    gap: 10,
    marginTop: 8,
  },
  actionsSection: {
    gap: 10,
  },
  formLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
