import axios from 'axios';

import { ApiErrorResponse } from '../types/api';

export const getErrorMessage = (error: unknown, fallback = 'Unexpected error'): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
