import Constants from 'expo-constants';

const fromPublicEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
const fromExpoConfig = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

export const API_BASE_URL = fromExpoConfig ?? fromPublicEnv ?? 'http://10.0.2.2:8001/api';
