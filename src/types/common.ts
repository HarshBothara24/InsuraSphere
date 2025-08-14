export type FormFieldValue = string | number | boolean | Date | string[];

export interface ApiError extends Error {
  status?: number;
  details?: Record<string, unknown>;
}

export interface DocumentData {
  id: string;
  [key: string]: unknown;
}