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
import { useRegister } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../types/navigation';
import { getErrorMessage } from '../../utils/error';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const schema = z.object({
  name: z.string().min(2, 'Minimum 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export const RegisterScreen = ({ navigation }: Props) => {
  const registerMutation = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    await registerMutation.mutateAsync(values);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Register to access your collaborative workspace.</Text>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput label="Name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
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
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            error={errors.password?.message}
          />
        )}
      />

      {registerMutation.error ? <ErrorState message={getErrorMessage(registerMutation.error)} /> : null}

      <AppButton label="Register" onPress={handleSubmit(onSubmit)} loading={registerMutation.isPending} />
      <AppButton label="Back to login" variant="secondary" onPress={() => navigation.navigate('Login')} />
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
