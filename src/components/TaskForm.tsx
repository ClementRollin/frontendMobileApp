import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { taskPriorityOptions, taskStatusOptions } from '../constants/taskOptions';
import { useUsers } from '../hooks/useUsers';
import { CreateTaskPayload, TaskPriority, TaskStatus } from '../types/task';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';
import { ErrorState } from './ErrorState';
import { OptionChips } from './OptionChips';

const taskSchema = z.object({
  title: z.string().min(3, 'Minimum 3 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value),
      'Use ISO 8601 format (example: 2026-03-11T16:30:00Z)',
    ),
  assignee_id: z.number().nullable().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

type Props = {
  initialValues: TaskFormValues;
  submitLabel: string;
  loading?: boolean;
  errorMessage?: string;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
};

export const TaskForm = ({ initialValues, submitLabel, loading, errorMessage, onSubmit }: Props) => {
  const usersQuery = useUsers();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialValues,
  });

  const selectedStatus = watch('status');
  const selectedPriority = watch('priority');
  const selectedAssignee = watch('assignee_id');

  const assigneeOptions = [
    { label: 'Unassigned', value: null as number | null },
    ...(usersQuery.data ?? []).map((user) => ({ label: user.name, value: user.id })),
  ];

  const submit = async (values: TaskFormValues) => {
    await onSubmit({
      title: values.title,
      description: values.description || null,
      assignee_id: values.assignee_id ?? null,
      status: values.status as TaskStatus,
      priority: values.priority as TaskPriority,
      due_date: values.due_date ? values.due_date : null,
    });
  };

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput label="Title" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            label="Description"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            style={styles.multiline}
            error={errors.description?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="due_date"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            label="Due datetime (ISO 8601)"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="2026-03-11T16:30:00Z"
            autoCapitalize="none"
            error={errors.due_date?.message}
          />
        )}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Status</Text>
        <OptionChips
          options={taskStatusOptions}
          value={selectedStatus}
          onChange={(value) => setValue('status', value as TaskStatus)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Priority</Text>
        <OptionChips
          options={taskPriorityOptions}
          value={selectedPriority}
          onChange={(value) => setValue('priority', value as TaskPriority)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Assignee</Text>
        <OptionChips options={assigneeOptions} value={selectedAssignee ?? null} onChange={(value) => setValue('assignee_id', value as number | null)} />
      </View>

      {errorMessage ? <ErrorState message={errorMessage} /> : null}
      <AppButton label={submitLabel} onPress={handleSubmit(submit)} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
