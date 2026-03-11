import axios from 'axios';

import { ApiError } from '../types/api';

const networkFallback = "Impossible de contacter l'API. Vérifiez que le backend est démarré et que l'URL est correcte.";

export const getErrorMessage = (error: unknown, fallback = 'Une erreur inattendue est survenue.'): string => {
  if (axios.isAxiosError<ApiError>(error)) {
    if (!error.response) {
      return networkFallback;
    }

    const payload = error.response.data;
    if (payload?.errors) {
      const firstField = Object.keys(payload.errors)[0];
      const firstMessages = firstField ? payload.errors[firstField] : [];
      const firstMessage = firstMessages?.[0];
      if (firstMessage) {
        return firstMessage;
      }
    }

    return payload?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
