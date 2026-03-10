import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../components/ScreenContainer';
import { TaskForm } from '../../components/TaskForm';
import { colors } from '../../constants/theme';
import { useCreateTask } from '../../hooks/useTasks';
import { MainStackParamList } from '../../types/navigation';
import { CreateTaskPayload } from '../../types/task';
import { isWithinNext24Hours } from '../../utils/date';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskCreate'>;

export const TaskCreateScreen = ({ navigation }: Props) => {
  const createTaskMutation = useCreateTask();

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

    const result = await createTaskMutation.mutateAsync(payload);

    if (!result.notificationResult.scheduled && result.notificationResult.reason === 'permission_denied') {
      Alert.alert('Notifications', "Permission refusee. L'application reste utilisable sans rappels.");
    }

    navigation.goBack();
  };

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Creer une tache</Text>
      <TaskForm
        initialValues={{
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          due_date: '',
          assignee_id: null,
        }}
        submitLabel="Enregistrer la tache"
        loading={createTaskMutation.isPending}
        errorMessage={createTaskMutation.error ? getErrorMessage(createTaskMutation.error) : undefined}
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
