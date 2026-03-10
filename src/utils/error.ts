import axios from 'axios';

import { ApiErrorResponse } from '../types/api';

export const getErrorMessage = (error: unknown, fallback = 'Erreur inattendue'): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return "Impossible de contacter l'API. Verifie que le backend tourne et que l'URL API est correcte.";
    }
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
