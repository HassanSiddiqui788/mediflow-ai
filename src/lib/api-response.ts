import { NextResponse } from 'next/server';

export interface ApiResponseOptions {
  status?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function apiSuccess<T>(data: T, options?: ApiResponseOptions) {
  const status = options?.status ?? 200;
  const body: {
    success: true;
    data: T;
    pagination?: ApiResponseOptions['pagination'];
  } = {
    success: true,
    data,
  };

  if (options?.pagination) {
    body.pagination = options.pagination;
  }

  const response = NextResponse.json(body, { status });
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  return response;
}

export function apiError(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500
) {
  const response = NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status }
  );
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  return response;
}

export function handleApiError(
  error: unknown,
  defaultMessage: string = 'Internal server error',
  defaultCode: string = 'INTERNAL_ERROR',
  status: number = 500
) {
  console.error(defaultMessage, error);
  const message = error instanceof Error ? error.message : defaultMessage;
  return apiError(message, defaultCode, status);
}

