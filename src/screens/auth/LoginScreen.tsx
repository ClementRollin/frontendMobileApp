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
import { useLogin } from '../../hooks/useAuth';
import { LoginFormValues } from '../../types/auth';
import { AuthStackParamList } from '../../types/navigation';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

export const LoginScreen = ({ navigation }: Props) => {
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Accédez à votre espace de gestion des tâches.</Text>
      </View>

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

      {loginMutation.error ? <ErrorState message={getErrorMessage(loginMutation.error)} /> : null}

      <AppButton label="Se connecter" onPress={handleSubmit(onSubmit)} loading={loginMutation.isPending} />
      <AppButton label="Créer un compte" variant="secondary" onPress={() => navigation.navigate('Register')} />
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
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
