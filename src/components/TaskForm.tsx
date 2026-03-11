import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { priorityLabelFr } from '../constants/labels';
import { taskPriorityOptions } from '../constants/taskOptions';
import { useTags } from '../hooks/useTags';
import { useTeamMemberships, useTeams } from '../hooks/useTeams';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import { CreateTaskPayload, TaskPriority, UpdateTaskPayload } from '../types/task';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingBlock } from './LoadingBlock';
import { MultiOptionChips } from './MultiOptionChips';
import { OptionChips } from './OptionChips';

const taskSchema = z.object({
  team_id: z.number().min(1, "L'équipe est obligatoire"),
  title: z.string().min(3, 'Minimum 3 caractères'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional().refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Date invalide'),
  assignee_id: z.number().nullable().optional(),
  tag_ids: z.array(z.number()).optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

type Props = {
  initialValues: TaskFormValues;
  submitLabel: string;
  loading?: boolean;
  errorMessage?: string;
  mode: 'create' | 'edit';
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
};

export const TaskForm = ({ initialValues, submitLabel, loading, errorMessage, mode, onSubmit }: Props) => {
  const currentUser = useAuthStore((state) => state.user);
  const teamsQuery = useTeams();
  const usersQuery = useUsers();
  const tagsQuery = useTags();

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
  const [selectedMinute, setSelectedMinute] = useState<string>(
    String((initialDueDate ?? new Date()).getMinutes()).padStart(2, '0'),
  );
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

  const selectedTeamId = watch('team_id');
  const selectedPriority = watch('priority');
  const selectedAssignee = watch('assignee_id');
  const selectedTagIds = watch('tag_ids') ?? [];
  const previousTeamId = useRef<number | undefined>(selectedTeamId);

  const membershipsQuery = useTeamMemberships(selectedTeamId ?? null);

  const teamOptions = useMemo(
    () => (teamsQuery.data ?? []).map((team) => ({ label: team.name, value: team.id })),
    [teamsQuery.data],
  );

  useEffect(() => {
    const firstTeam = teamOptions[0];
    if (!selectedTeamId && firstTeam) {
      setValue('team_id', firstTeam.value, { shouldValidate: true });
    }
  }, [selectedTeamId, setValue, teamOptions]);

  const assignableOptions = useMemo(() => {
    const allUsers = usersQuery.data ?? [];
    const memberships = membershipsQuery.data ?? [];
    const allowedIds = new Set(memberships.map((membership) => membership.user_id));
    return [
      { label: 'Non assignée', value: null as number | null },
      ...allUsers
        .filter((user) => {
          if (!allowedIds.has(user.id)) {
            return false;
          }
          if (user.role === 'developer') {
            return true;
          }
          return currentUser?.id === user.id && user.role === 'lead_dev';
        })
        .map((user) => ({ label: user.name, value: user.id })),
    ];
  }, [currentUser?.id, membershipsQuery.data, usersQuery.data]);

  const tagOptions = useMemo(
    () =>
      (tagsQuery.data ?? []).map((tag) => ({
        label: tag.name,
        value: tag.id,
      })),
    [tagsQuery.data],
  );

  const hourOptions = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        label: `${String(index).padStart(2, '0')}h`,
        value: String(index).padStart(2, '0'),
      })),
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
    if (previousTeamId.current !== undefined && previousTeamId.current !== selectedTeamId) {
      setValue('assignee_id', null, { shouldValidate: true });
    }
    previousTeamId.current = selectedTeamId;
  }, [selectedTeamId, setValue]);

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
    const commonPayload = {
      team_id: values.team_id,
      title: values.title,
      description: values.description || null,
      assignee_id: values.assignee_id ?? null,
      priority: values.priority as TaskPriority,
      due_date: values.due_date ? values.due_date : null,
      tag_ids: values.tag_ids ?? [],
    };

    if (mode === 'create') {
      await onSubmit({
        ...commonPayload,
        status: 'todo',
      });
      return;
    }

    await onSubmit(commonPayload);
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
      {teamsQuery.isLoading ? <LoadingBlock /> : null}
      {teamsQuery.isError ? <ErrorState message="Impossible de charger les équipes." /> : null}
      {!teamsQuery.isLoading && !(teamsQuery.data ?? []).length ? (
        <EmptyState title="Aucune équipe gérée" subtitle="Vous devez appartenir à une équipe pour créer une tâche." />
      ) : null}

      <Controller
        control={control}
        name="team_id"
        render={() => (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Équipe</Text>
            <OptionChips
              options={teamOptions}
              value={selectedTeamId ?? (teamOptions[0]?.value ?? 0)}
              onChange={(value) => setValue('team_id', value as number)}
            />
            {errors.team_id?.message ? <Text style={styles.validationText}>{errors.team_id?.message}</Text> : null}
          </View>
        )}
      />

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
            <Text style={styles.sectionLabel}>Échéance</Text>

            {!hasDueDate ? (
              <AppButton
                label="Ajouter une échéance"
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
                  label="Retirer l'échéance"
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
        <Text style={styles.sectionLabel}>Priorité</Text>
        <OptionChips
          options={taskPriorityOptions}
          value={selectedPriority}
          onChange={(value) => setValue('priority', value as TaskPriority)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Assignation</Text>
        {membershipsQuery.isLoading ? <LoadingBlock /> : null}
        <OptionChips
          options={assignableOptions}
          value={selectedAssignee ?? null}
          onChange={(value) => setValue('assignee_id', value as number | null)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tags</Text>
        <MultiOptionChips options={tagOptions} values={selectedTagIds} onChange={(next) => setValue('tag_ids', next)} />
      </View>

      {errorMessage ? <ErrorState message={errorMessage} /> : null}
      <AppButton label={submitLabel} onPress={handleSubmit(submit)} loading={loading} />
      <Text style={styles.info}>Priorité sélectionnée: {priorityLabelFr[selectedPriority]}</Text>
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
  info: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
});
