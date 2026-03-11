import React, { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../components/ScreenContainer';
import { TaskForm } from '../../components/TaskForm';
import { colors } from '../../constants/theme';
import { useCreateTask } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/authStore';
import { MainStackParamList } from '../../types/navigation';
import { CreateTaskPayload } from '../../types/task';
import { isWithinNext24Hours } from '../../utils/date';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskCreate'>;

export const TaskCreateScreen = ({ navigation }: Props) => {
  const role = useAuthStore((state) => state.role);
  const createTaskMutation = useCreateTask();

  useEffect(() => {
    if (role !== 'lead_dev') {
      navigation.replace('AccessDenied');
    }
  }, [navigation, role]);

  if (role !== 'lead_dev') {
    return null;
  }

  const handleSubmit = async (payload: CreateTaskPayload) => {
    if (payload.due_date && isWithinNext24Hours(payload.due_date)) {
      await new Promise<void>((resolve) => {
        Alert.alert(
          'Notifications locales',
          "Nous demandons l'autorisation pour vous rappeler cette échéance.",
          [{ text: 'Continuer', onPress: () => resolve() }],
        );
      });
    }

    const result = await createTaskMutation.mutateAsync(payload);

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
      <Text style={styles.title}>Créer une tâche</Text>
      <TaskForm
        mode="create"
        initialValues={{
          team_id: 0,
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
          assignee_id: null,
          tag_ids: [],
        }}
        submitLabel="Enregistrer la tâche"
        loading={createTaskMutation.isPending}
        errorMessage={createTaskMutation.error ? getErrorMessage(createTaskMutation.error) : undefined}
        onSubmit={(payload) => handleSubmit(payload as CreateTaskPayload)}
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
