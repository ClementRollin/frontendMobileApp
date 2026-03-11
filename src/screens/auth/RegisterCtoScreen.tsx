import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { ErrorState } from '../../components/ErrorState';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';
import { useRegisterCto } from '../../hooks/useAuth';
import { RegisterCtoFormValues } from '../../types/auth';
import { AuthStackParamList } from '../../types/navigation';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterCto'>;

const schema = z
  .object({
    organization_name: z.string().min(2, "Le nom de l'organisation est requis"),
    organization_slug: z.string().optional(),
    first_name: z.string().min(2, 'Le prénom est requis'),
    last_name: z.string().min(2, 'Le nom est requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    password_confirmation: z.string().min(8, 'Minimum 8 caractères'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  });

export const RegisterCtoScreen = ({ navigation }: Props) => {
  const registerMutation = useRegisterCto();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCtoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      organization_name: '',
      organization_slug: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (values: RegisterCtoFormValues) => {
    const payload = {
      ...values,
      organization_slug: values.organization_slug?.trim() || undefined,
    };
    await registerMutation.mutateAsync(payload);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>Première inscription CTO</Text>
        <Text style={styles.subtitle}>Créez votre organisation puis invitez vos leads et PO.</Text>
      </View>

      <Controller
        control={control}
        name="organization_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Nom de l'organisation"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.organization_name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="organization_slug"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Slug organisation (optionnel)"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            error={errors.organization_slug?.message}
            placeholder="ex: acme-tech"
          />
        )}
      />

      <Controller
        control={control}
        name="first_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput label="Prénom" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.first_name?.message} />
        )}
      />

      <Controller
        control={control}
        name="last_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput label="Nom" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.last_name?.message} />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Mot de passe"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password_confirmation"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Confirmer le mot de passe"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            error={errors.password_confirmation?.message}
          />
        )}
      />

      {registerMutation.error ? <ErrorState message={getErrorMessage(registerMutation.error)} /> : null}

      <AppButton label="Créer mon espace CTO" onPress={handleSubmit(onSubmit)} loading={registerMutation.isPending} />
      <AppButton label="Retour accueil" variant="secondary" onPress={() => navigation.navigate('Home')} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
