import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useMe } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList, MainStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { TaskCreateScreen } from '../screens/tasks/TaskCreateScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { TaskEditScreen } from '../screens/tasks/TaskEditScreen';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { WelcomeScreen } from '../screens/common/WelcomeScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
    <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Tasks' }} />
    <MainStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task detail' }} />
    <MainStack.Screen name="TaskCreate" component={TaskCreateScreen} options={{ title: 'Create task' }} />
    <MainStack.Screen name="TaskEdit" component={TaskEditScreen} options={{ title: 'Edit task' }} />
    <MainStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <MainStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </MainStack.Navigator>
);

export const AppNavigator = () => {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [showWelcome, setShowWelcome] = useState(true);
  useMe();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const timer = setTimeout(() => setShowWelcome(false), 900);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  const content = useMemo(() => {
    if (token) {
      return <MainNavigator />;
    }

    return <AuthNavigator />;
  }, [token]);

  if (!isHydrated || showWelcome) {
    return <WelcomeScreen />;
  }

  return <NavigationContainer>{content}</NavigationContainer>;
};
