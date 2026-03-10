import { format, parseISO } from 'date-fns';

export const formatDateTime = (isoDate?: string | null): string => {
  if (!isoDate) {
    return 'Aucune echeance';
  }

  try {
    return format(parseISO(isoDate), 'dd/MM/yyyy HH:mm');
  } catch {
    return isoDate;
  }
};

export const isFutureDate = (isoDate?: string | null): boolean => {
  if (!isoDate) {
    return false;
  }

  const date = new Date(isoDate);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
};

export const isWithinNext24Hours = (isoDate?: string | null): boolean => {
  if (!isoDate) {
    return false;
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = Date.now();
  const diffMs = date.getTime() - now;
  return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
};
