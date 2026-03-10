import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { taskPriorityOptions, taskStatusOptions } from '../constants/taskOptions';
import { useUsers } from '../hooks/useUsers';
import { CreateTaskPayload, TaskPriority, TaskStatus } from '../types/task';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';
import { ErrorState } from './ErrorState';
import { OptionChips } from './OptionChips';

const taskSchema = z.object({
  title: z.string().min(3, 'Minimum 3 caracteres'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional().refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Date invalide'),
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
  const initialDueDate = useMemo(() => {
    if (!initialValues.due_date) {
      return null;
    }
    const parsed = new Date(initialValues.due_date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [initialValues.due_date]);
  const [hasDueDate, setHasDueDate] = useState(Boolean(initialDueDate));
  const [selectedDate, setSelectedDate] = useState<Date>(initialDueDate ?? new Date());
  const [selectedHour, setSelectedHour] = useState<string>(String((initialDueDate ?? new Date()).getHours()).padStart(2, '0'));
  const [selectedMinute, setSelectedMinute] = useState<string>(String((initialDueDate ?? new Date()).getMinutes()).padStart(2, '0'));
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    { label: 'Non assignee', value: null as number | null },
    ...(usersQuery.data ?? []).map((user) => ({ label: user.name, value: user.id })),
  ];
  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, index) => ({ label: `${String(index).padStart(2, '0')}h`, value: String(index).padStart(2, '0') })),
    [],
  );
  const minuteOptions = useMemo(
    () =>
      ['00', '15', '30', '45'].map((minute) => ({
        label: `${minute} min`,
        value: minute,
      })),
    [],
  );

  useEffect(() => {
    if (!hasDueDate) {
      setValue('due_date', '', { shouldValidate: true });
      return;
    }

    const composedDate = new Date(selectedDate);
    composedDate.setHours(Number(selectedHour), Number(selectedMinute), 0, 0);
    setValue('due_date', composedDate.toISOString(), { shouldValidate: true });
  }, [hasDueDate, selectedDate, selectedHour, selectedMinute, setValue]);

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

  const onDateChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput label="Titre" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
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
        render={() => (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Echeance</Text>

            {!hasDueDate ? (
              <AppButton
                label="Ajouter une echeance"
                variant="secondary"
                onPress={() => {
                  setHasDueDate(true);
                  setShowDatePicker(true);
                }}
              />
            ) : (
              <View style={styles.deadlinePanel}>
                <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateButtonLabel}>Date</Text>
                  <Text style={styles.dateButtonValue}>{format(selectedDate, 'dd/MM/yyyy')}</Text>
                </Pressable>

                {showDatePicker ? (
                  <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} />
                ) : null}

                <View style={styles.inlineSection}>
                  <Text style={styles.inlineLabel}>Heure</Text>
                  <OptionChips options={hourOptions} value={selectedHour} onChange={(value) => setSelectedHour(value as string)} />
                </View>

                <View style={styles.inlineSection}>
                  <Text style={styles.inlineLabel}>Minutes</Text>
                  <OptionChips options={minuteOptions} value={selectedMinute} onChange={(value) => setSelectedMinute(value as string)} />
                </View>

                <AppButton
                  label="Retirer l'echeance"
                  variant="secondary"
                  onPress={() => {
                    setHasDueDate(false);
                    setShowDatePicker(false);
                  }}
                />
              </View>
            )}
            {errors.due_date?.message ? <Text style={styles.validationText}>{errors.due_date?.message}</Text> : null}
          </View>
        )}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Statut</Text>
        <OptionChips
          options={taskStatusOptions}
          value={selectedStatus}
          onChange={(value) => setValue('status', value as TaskStatus)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Priorite</Text>
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
  deadlinePanel: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  dateButtonLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  dateButtonValue: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  inlineSection: {
    gap: 6,
  },
  inlineLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  validationText: {
    color: '#DC2626',
    fontSize: 12,
  },
});
