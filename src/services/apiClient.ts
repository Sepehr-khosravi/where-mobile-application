/**
 * services/apiClient.ts
 *
 * The real HTTP client for your NestJS backend. Every authenticated
 * request goes through `apiRequest()`, which automatically attaches
 * the stored JWT as `Authorization: Bearer <token>` — no endpoint
 * function needs to handle auth headers itself.
 *
 * Routes confirmed from your Nest log:
 *   AuthController       /auth
 *   UserController       /users
 *   RelationController   /relations
 */

import { ENV } from '../config/env';
import { clearSessionToken, getSessionToken } from './authStorage';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown; // plain object — we JSON.stringify it for you
  // Most endpoints need the token; the 4 pre-login auth endpoints don't.
  skipAuth?: boolean;
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (!skipAuth) {
    const token = await getSessionToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${ENV.API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 / empty body responses (e.g. some POST actions) have nothing to parse
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // 401 specifically means the token is dead — clear it so the auth
    // gatekeeper in app/_layout.tsx routes back to login on next check,
    // rather than the app silently failing every request forever.
    if (res.status === 401) {
      await clearSessionToken();
    }
    const message =
      (data && typeof data === 'object' && 'message' in data && String((data as any).message)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  delete: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE', body }),
};
