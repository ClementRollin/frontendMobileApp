import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingBlock } from '../../components/LoadingBlock';
import { ScreenContainer } from '../../components/ScreenContainer';
import { emptyStateLabels } from '../../constants/labels';
import { colors } from '../../constants/theme';
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from '../../hooks/useTags';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../utils/error';

const initialColor = '#2563EB';

export const TagManagementScreen = () => {
  const role = useAuthStore((state) => state.role);
  const [name, setName] = useState('');
  const [color, setColor] = useState(initialColor);
  const [editingId, setEditingId] = useState<number | null>(null);

  const tagsQuery = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  if (role !== 'lead_dev') {
    return (
      <ScreenContainer>
        <ErrorState message="Accès refusé." />
      </ScreenContainer>
    );
  }

  const submit = async () => {
    if (!name.trim()) {
      return;
    }

    if (editingId) {
      await updateMutation.mutateAsync({ tagId: editingId, payload: { name: name.trim(), color: color.trim() || null } });
    } else {
      await createMutation.mutateAsync({ name: name.trim(), color: color.trim() || null });
    }

    setEditingId(null);
    setName('');
    setColor(initialColor);
  };

  const onEdit = (id: number, nextName: string, nextColor: string | null) => {
    setEditingId(id);
    setName(nextName);
    setColor(nextColor ?? initialColor);
  };

  const onDelete = (tagId: number) => {
    Alert.alert('Supprimer le tag', 'Voulez-vous supprimer ce tag ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteMutation.mutateAsync(tagId);
        },
      },
    ]);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <ScreenContainer>
      <View style={styles.formCard}>
        <Text style={styles.title}>{editingId ? 'Modifier le tag' : 'Créer un tag'}</Text>
        <AppInput label="Nom du tag" value={name} onChangeText={setName} placeholder="Ex: Backend" />
        <AppInput label="Couleur hexadécimale" value={color} onChangeText={setColor} placeholder="#2563EB" />
        <View style={styles.actions}>
          <AppButton
            label={editingId ? 'Mettre à jour' : 'Créer'}
            onPress={submit}
            loading={isSubmitting}
          />
          {editingId ? (
            <AppButton
              label="Annuler"
              variant="secondary"
              onPress={() => {
                setEditingId(null);
                setName('');
                setColor(initialColor);
              }}
            />
          ) : null}
        </View>
      </View>

      {tagsQuery.isLoading ? <LoadingBlock /> : null}
      {tagsQuery.isError ? <ErrorState message={getErrorMessage(tagsQuery.error)} /> : null}
      {createMutation.error ? <ErrorState message={getErrorMessage(createMutation.error)} /> : null}
      {updateMutation.error ? <ErrorState message={getErrorMessage(updateMutation.error)} /> : null}
      {deleteMutation.error ? <ErrorState message={getErrorMessage(deleteMutation.error)} /> : null}

      {!tagsQuery.isLoading && !tagsQuery.data?.length ? (
        <EmptyState title={emptyStateLabels.tags.title} subtitle={emptyStateLabels.tags.subtitle} />
      ) : null}

      <FlatList
        data={tagsQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <View style={[styles.colorDot, { backgroundColor: item.color ?? '#94A3B8' }]} />
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.color ?? '-'}</Text>
              </View>
            </View>
            <View style={styles.rowActions}>
              <AppButton label="Modifier" variant="secondary" onPress={() => onEdit(item.id, item.name, item.color)} />
              <AppButton
                label="Supprimer"
                variant="danger"
                onPress={() => onDelete(item.id)}
                loading={deleteMutation.isPending}
              />
            </View>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  actions: {
    gap: 8,
  },
  list: {
    gap: 8,
    paddingBottom: 24,
  },
  row: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  info: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  rowActions: {
    gap: 8,
  },
});
