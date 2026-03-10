import React, { useState } from 'react';
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
import { colors } from '../../constants/theme';
import { useAddComment, useTaskComments } from '../../hooks/useComments';
import { useDeleteTask, useTask, useUpdateTaskStatus } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/authStore';
import { MainStackParamList } from '../../types/navigation';
import { TaskStatus } from '../../types/task';
import { formatDateTime } from '../../utils/date';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskDetail'>;

const statusOptions = [
  { label: 'A faire', value: 'todo' as const },
  { label: 'En cours', value: 'in_progress' as const },
  { label: 'Terminee', value: 'done' as const },
];

export const TaskDetailScreen = ({ route, navigation }: Props) => {
  const { taskId } = route.params;
  const currentUser = useAuthStore((state) => state.user);
  const [commentContent, setCommentContent] = useState('');

  const taskQuery = useTask(taskId);
  const commentsQuery = useTaskComments(taskId);
  const statusMutation = useUpdateTaskStatus();
  const deleteMutation = useDeleteTask();
  const addCommentMutation = useAddComment(taskId);

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
  const isCreator = currentUser?.id === task.creator_id;
  const canComment = currentUser?.id === task.creator_id || currentUser?.id === task.assignee_id;

  const updateStatus = async (status: TaskStatus) => {
    await statusMutation.mutateAsync({ taskId: task.id, payload: { status } });
  };

  const confirmDelete = () => {
    Alert.alert('Supprimer la tache', 'Voulez-vous vraiment supprimer cette tache ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
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

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={styles.badges}>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </View>
          <Text style={styles.meta}>Echeance: {formatDateTime(task.due_date)}</Text>
          <Text style={styles.meta}>Createur: {task.creator?.name ?? `#${task.creator_id}`}</Text>
          <Text style={styles.meta}>Assignee: {task.assignee?.name ?? 'Non assignee'}</Text>
          <Text style={styles.description}>{task.description || 'Aucune description'}</Text>
        </View>

        {isCreator ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mettre a jour le statut</Text>
            <OptionChips options={statusOptions} value={task.status} onChange={(value) => updateStatus(value as TaskStatus)} />
            <View style={styles.row}>
              <AppButton label="Modifier" onPress={() => navigation.navigate('TaskEdit', { task })} />
              <AppButton
                label="Supprimer"
                variant="danger"
                onPress={confirmDelete}
                loading={deleteMutation.isPending}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Commentaires</Text>
          {commentsQuery.isLoading ? <LoadingBlock /> : null}
          {commentsQuery.isError ? <ErrorState message={getErrorMessage(commentsQuery.error)} /> : null}
          {!commentsQuery.isLoading && !commentsQuery.data?.length ? (
            <EmptyState title="Aucun commentaire" subtitle="Ajoutez un premier commentaire." />
          ) : null}

          {commentsQuery.data?.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Text style={styles.commentAuthor}>{comment.user?.name ?? `Utilisateur #${comment.user_id}`}</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <Text style={styles.commentMeta}>{formatDateTime(comment.created_at)}</Text>
            </View>
          ))}

          {canComment ? (
            <View style={styles.commentForm}>
              <AppInput
                label="Ajouter un commentaire"
                value={commentContent}
                onChangeText={setCommentContent}
                placeholder="Ecrivez votre commentaire..."
              />
              <AppButton label="Envoyer" onPress={submitComment} loading={addCommentMutation.isPending} />
            </View>
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
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  comment: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    gap: 3,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  commentContent: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  commentMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commentForm: {
    gap: 10,
    marginTop: 8,
  },
});
