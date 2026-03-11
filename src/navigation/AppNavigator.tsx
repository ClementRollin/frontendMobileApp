import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useMe } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList, MainStackParamList } from '../types/navigation';
import { AuthHomeScreen } from '../screens/auth/AuthHomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterCtoScreen } from '../screens/auth/RegisterCtoScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { AccessDeniedScreen } from '../screens/common/AccessDeniedScreen';
import { SessionLoadingScreen } from '../screens/common/SessionLoadingScreen';
import { InvitationManagementScreen } from '../screens/invitations/InvitationManagementScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { TagManagementScreen } from '../screens/tags/TagManagementScreen';
import { TaskCreateScreen } from '../screens/tasks/TaskCreateScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { TaskEditScreen } from '../screens/tasks/TaskEditScreen';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="Home" component={AuthHomeScreen} options={{ title: 'Accueil' }} />
    <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
    <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
    <AuthStack.Screen name="RegisterCto" component={RegisterCtoScreen} options={{ title: 'Inscription CTO' }} />
  </AuthStack.Navigator>
);

type Role = 'cto' | 'lead_dev' | 'developer' | 'po';

const MainNavigator = ({ role }: { role: Role }) => (
  <MainStack.Navigator>
    <MainStack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Taches' }} />
    <MainStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Detail tache' }} />
    {role === 'lead_dev' ? (
      <>
        <MainStack.Screen name="TaskCreate" component={TaskCreateScreen} options={{ title: 'Creer une tache' }} />
        <MainStack.Screen name="TaskEdit" component={TaskEditScreen} options={{ title: 'Modifier la tache' }} />
        <MainStack.Screen name="TagManagement" component={TagManagementScreen} options={{ title: 'Gestion des tags' }} />
      </>
    ) : null}
    {role === 'lead_dev' || role === 'cto' ? (
      <MainStack.Screen
        name="InvitationManagement"
        component={InvitationManagementScreen}
        options={{ title: "Codes d'invitation" }}
      />
    ) : null}
    <MainStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Parametres' }} />
    <MainStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    <MainStack.Screen name="AccessDenied" component={AccessDeniedScreen} options={{ title: 'Acces refuse' }} />
  </MainStack.Navigator>
);

export const AppNavigator = () => {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const clearSession = useAuthStore((state) => state.clearSession);

  const shouldFetchMe = isHydrated && Boolean(token);
  const meQuery = useMe(shouldFetchMe);

  useEffect(() => {
    if (shouldFetchMe && meQuery.isError) {
      clearSession();
    }
  }, [clearSession, meQuery.isError, shouldFetchMe]);

  const isBootLoading = !isHydrated || (shouldFetchMe && meQuery.isPending) || (shouldFetchMe && meQuery.isError);

  if (isBootLoading) {
    return <SessionLoadingScreen />;
  }

  if (!token) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  if (!role || !['cto', 'lead_dev', 'developer', 'po'].includes(role)) {
    return (
      <NavigationContainer>
        <MainStack.Navigator>
          <MainStack.Screen name="AccessDenied" component={AccessDeniedScreen} options={{ title: 'Acces refuse' }} />
        </MainStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <MainNavigator role={role as Role} />
    </NavigationContainer>
  );
};
