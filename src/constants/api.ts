import Constants from 'expo-constants';

const fromExpoConfig = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

export const API_BASE_URL = fromExpoConfig ?? 'http://10.0.2.2:8000/api';
