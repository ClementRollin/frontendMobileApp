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
import { AuthStackParamList } from '../../types/navigation';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export const LoginScreen = ({ navigation }: Props) => {
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'alice@example.com',
      password: 'password123',
    },
  });

  const onSubmit = async (values: FormValues) => {
    await loginMutation.mutateAsync(values);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue managing collaborative tasks.</Text>
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
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            error={errors.password?.message}
          />
        )}
      />

      {loginMutation.error ? <ErrorState message={getErrorMessage(loginMutation.error)} /> : null}

      <AppButton label="Login" onPress={handleSubmit(onSubmit)} loading={loginMutation.isPending} />
      <AppButton label="Create account" variant="secondary" onPress={() => navigation.navigate('Register')} />
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
