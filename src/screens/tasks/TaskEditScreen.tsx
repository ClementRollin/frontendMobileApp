import React, { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../components/ScreenContainer';
import { TaskForm } from '../../components/TaskForm';
import { colors } from '../../constants/theme';
import { useUpdateTask } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/authStore';
import { MainStackParamList } from '../../types/navigation';
import { UpdateTaskPayload } from '../../types/task';
import { isWithinNext24Hours } from '../../utils/date';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskEdit'>;

export const TaskEditScreen = ({ route, navigation }: Props) => {
  const role = useAuthStore((state) => state.role);
  const { task } = route.params;
  const updateTaskMutation = useUpdateTask();

  useEffect(() => {
    if (role !== 'lead_dev') {
      navigation.replace('AccessDenied');
    }
  }, [navigation, role]);

  if (role !== 'lead_dev') {
    return null;
  }

  const handleSubmit = async (payload: UpdateTaskPayload) => {
    if (payload.due_date && isWithinNext24Hours(payload.due_date)) {
      await new Promise<void>((resolve) => {
        Alert.alert(
          'Notifications locales',
          "Nous demandons l'autorisation pour vous rappeler cette échéance.",
          [{ text: 'Continuer', onPress: () => resolve() }],
        );
      });
    }

    const result = await updateTaskMutation.mutateAsync({
      taskId: task.id,
      payload,
    });

    if (!result.notificationResult.scheduled && result.notificationResult.reason === 'permission_denied') {
      Alert.alert('Notifications', "Permission refusée. L'application reste utilisable sans rappels.");
    }

    if (!result.notificationResult.scheduled && result.notificationResult.reason === 'unavailable_in_expo_go') {
      Alert.alert(
        'Notifications',
        "Les notifications locales ne sont pas disponibles dans Expo Go. Utilisez un build de développement pour les tester.",
      );
    }

    navigation.goBack();
  };

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Modifier la tâche</Text>
      <TaskForm
        mode="edit"
        initialValues={{
          team_id: task.team_id,
          title: task.title,
          description: task.description ?? '',
          priority: task.priority,
          due_date: task.due_date ?? '',
          assignee_id: task.assignee_id,
          tag_ids: task.tags?.map((tag) => tag.id) ?? [],
        }}
        submitLabel="Mettre à jour la tâche"
        loading={updateTaskMutation.isPending}
        errorMessage={updateTaskMutation.error ? getErrorMessage(updateTaskMutation.error) : undefined}
        onSubmit={(payload) => handleSubmit(payload as UpdateTaskPayload)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
});
