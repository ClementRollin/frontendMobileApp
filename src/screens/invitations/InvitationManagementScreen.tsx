import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingBlock } from '../../components/LoadingBlock';
import { OptionChips } from '../../components/OptionChips';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';
import { useCreateInvitation, useInvitations, useRevokeInvitation } from '../../hooks/useInvitations';
import { useCreateTeam, useTeams } from '../../hooks/useTeams';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { getErrorMessage } from '../../utils/error';

type InvitationTargetRole = Extract<UserRole, 'lead_dev' | 'developer' | 'po'>;

const roleLabel: Record<InvitationTargetRole, string> = {
  lead_dev: 'Lead Dev',
  developer: 'Développeur',
  po: 'PO',
};

export const InvitationManagementScreen = () => {
  const role = useAuthStore((state) => state.role);

  const invitationsQuery = useInvitations();
  const teamsQuery = useTeams();
  const createInvitationMutation = useCreateInvitation();
  const revokeMutation = useRevokeInvitation();
  const createTeamMutation = useCreateTeam();

  const [teamId, setTeamId] = useState<number>(0);
  const [targetRole, setTargetRole] = useState<InvitationTargetRole>('developer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  const canManageInvitations = role === 'cto' || role === 'lead_dev';
  const isCto = role === 'cto';

  const roleOptions = useMemo(() => {
    if (isCto) {
      return [
        { label: roleLabel.lead_dev, value: 'lead_dev' as InvitationTargetRole },
        { label: roleLabel.po, value: 'po' as InvitationTargetRole },
      ];
    }
    return [{ label: roleLabel.developer, value: 'developer' as InvitationTargetRole }];
  }, [isCto]);

  const teamOptions = useMemo(
    () => (teamsQuery.data ?? []).map((team) => ({ label: team.name, value: team.id })),
    [teamsQuery.data],
  );

  const normalizedTeamId = teamId || teamOptions[0]?.value || 0;

  const createInvitation = async () => {
    if (!normalizedTeamId) {
      Alert.alert('Equipe requise', "Selectionnez ou creez d'abord une equipe.");
      return;
    }

    await createInvitationMutation.mutateAsync({
      team_id: normalizedTeamId,
      target_role: targetRole,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
    });

    setFirstName('');
    setLastName('');
    setEmail('');
  };

  const createTeam = async () => {
    await createTeamMutation.mutateAsync({
      name: teamName.trim(),
      description: teamDescription.trim() || undefined,
    });
    setTeamName('');
    setTeamDescription('');
  };

  const revokeInvitation = (invitationId: number) => {
    Alert.alert('Révoquer le code', "Voulez-vous vraiment révoquer ce code d'invitation ?", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Révoquer',
        style: 'destructive',
        onPress: async () => {
          await revokeMutation.mutateAsync(invitationId);
        },
      },
    ]);
  };

  if (!canManageInvitations) {
    return (
      <ScreenContainer>
        <ErrorState message="Accès refusé." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={invitationsQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <View style={styles.card}>
              <Text style={styles.title}>Créer un code d'invitation</Text>
              <Text style={styles.subtitle}>
                {isCto
                  ? 'Le CTO peut inviter des leads et des PO.'
                  : "Le Lead Dev peut inviter uniquement des développeurs."}
              </Text>

              {teamsQuery.isLoading ? <LoadingBlock variant="inline" /> : null}
              {teamsQuery.isError ? <ErrorState message={getErrorMessage(teamsQuery.error)} /> : null}

              {!teamOptions.length ? (
                <EmptyState
                  title="Aucune équipe disponible"
                  subtitle={isCto ? "Créez d'abord une équipe." : 'Aucune équipe lead trouvée.'}
                />
              ) : (
                <OptionChips
                  options={teamOptions}
                  value={normalizedTeamId}
                  onChange={(value) => setTeamId(value as number)}
                />
              )}

              <Text style={styles.label}>Rôle ciblé</Text>
              <OptionChips
                options={roleOptions}
                value={targetRole}
                onChange={(value) => setTargetRole(value as InvitationTargetRole)}
              />

              <AppInput label="Prénom" value={firstName} onChangeText={setFirstName} />
              <AppInput label="Nom" value={lastName} onChangeText={setLastName} />
              <AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />

              {createInvitationMutation.error ? <ErrorState message={getErrorMessage(createInvitationMutation.error)} /> : null}
              <AppButton
                label="Générer le code"
                onPress={createInvitation}
                loading={createInvitationMutation.isPending}
              />
            </View>

            {isCto ? (
              <View style={styles.card}>
                <Text style={styles.title}>Créer une équipe</Text>
                <AppInput label="Nom de l'équipe" value={teamName} onChangeText={setTeamName} />
                <AppInput label="Description (optionnel)" value={teamDescription} onChangeText={setTeamDescription} />
                {createTeamMutation.error ? <ErrorState message={getErrorMessage(createTeamMutation.error)} /> : null}
                <AppButton label="Créer l'équipe" onPress={createTeam} loading={createTeamMutation.isPending} />
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>Codes générés</Text>
            {invitationsQuery.isLoading ? <LoadingBlock /> : null}
            {invitationsQuery.isError ? <ErrorState message={getErrorMessage(invitationsQuery.error)} /> : null}
            {!invitationsQuery.isLoading && !(invitationsQuery.data ?? []).length ? (
              <EmptyState title="Aucun code généré" subtitle="Créez votre premier code d'invitation." />
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.meta}>Cible: {roleLabel[item.target_role as InvitationTargetRole] ?? item.target_role}</Text>
            <Text style={styles.meta}>Nom: {item.first_name} {item.last_name}</Text>
            <Text style={styles.meta}>Email: {item.email}</Text>
            <Text style={styles.meta}>Équipe: {item.team?.name ?? `#${item.team_id ?? '-'}`}</Text>
            <Text style={styles.meta}>Statut: {item.revoked_at ? 'Révoqué' : item.used_at ? 'Utilisé' : 'Actif'}</Text>
            {!item.revoked_at && !item.used_at ? (
              <AppButton
                label="Révoquer"
                variant="danger"
                onPress={() => revokeInvitation(item.id)}
                loading={revokeMutation.isPending}
              />
            ) : null}
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 24,
  },
  headerArea: {
    gap: 10,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  code: {
    color: '#1D4ED8',
    fontWeight: '800',
    fontSize: 16,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
