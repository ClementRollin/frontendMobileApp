import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../components/ScreenContainer';
import { TaskForm } from '../../components/TaskForm';
import { colors } from '../../constants/theme';
import { useUpdateTask } from '../../hooks/useTasks';
import { MainStackParamList } from '../../types/navigation';
import { CreateTaskPayload } from '../../types/task';
import { isWithinNext24Hours } from '../../utils/date';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskEdit'>;

export const TaskEditScreen = ({ route, navigation }: Props) => {
  const { task } = route.params;
  const updateTaskMutation = useUpdateTask();

  const handleSubmit = async (payload: CreateTaskPayload) => {
    if (payload.due_date && isWithinNext24Hours(payload.due_date)) {
      await new Promise<void>((resolve) => {
        Alert.alert(
          'Notifications locales',
          "Nous demandons l'autorisation pour vous rappeler cette echeance.",
          [{ text: 'Continuer', onPress: () => resolve() }],
        );
      });
    }

    const result = await updateTaskMutation.mutateAsync({
      taskId: task.id,
      payload,
    });

    if (!result.notificationResult.scheduled && result.notificationResult.reason === 'permission_denied') {
      Alert.alert('Notifications', "Permission refusee. L'application reste utilisable sans rappels.");
    }

    navigation.goBack();
  };

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Modifier la tache</Text>
      <TaskForm
        initialValues={{
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          due_date: task.due_date ?? '',
          assignee_id: task.assignee_id,
        }}
        submitLabel="Mettre a jour la tache"
        loading={updateTaskMutation.isPending}
        errorMessage={updateTaskMutation.error ? getErrorMessage(updateTaskMutation.error) : undefined}
        onSubmit={handleSubmit}
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
