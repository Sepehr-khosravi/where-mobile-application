/**
 * services/auth.ts
 *
 * Real implementation against your NestJS AuthController routes:
 *   POST /auth/register
 *   POST /auth/login
 *   POST /auth/verify-email
 *   POST /auth/resend-code
 *   GET  /auth/check
 *
 * Error handling: ApiError (from services/apiClient.ts) carries the
 * raw server status/body. We map known statuses to the same
 * AuthErrorCode shape the UI already expects (app/(auth)/*.tsx was
 * built against this — no screen changes needed for the swap).
 *
 * ⚠️ TODO confirm with your backend:
 *  - Exact error response shape for RESEND_COOLDOWN (status code? does
 *    the body include a retry-after value, or do we need to compute it
 *    client-side from a Retry-After header?)
 *  - Exact status code for "username taken" vs "invalid email" vs
 *    "user not found" — currently guessing 409 / 400 / 404 respectively,
 *    common Nest conventions, but your actual exception filters may differ.
 */

import { VerifyResponseDTO } from '../types/api';
import {
  LoginDto,
  RegisterDto,
  ResendVerificationCodeDto,
  VerificationDto,
} from '../types/dto';
import { apiClient, ApiError } from './apiClient';
import { saveUserId } from './authStorage';

export type AuthErrorCode =
  | 'INVALID_EMAIL'
  | 'USERNAME_TAKEN'
  | 'USER_NOT_FOUND'
  | 'INVALID_CODE'
  | 'CODE_EXPIRED'
  | 'RESEND_COOLDOWN'
  | 'UNKNOWN';

export class AuthError extends Error {
  code: AuthErrorCode;
  retryAfterSeconds?: number;

  constructor(code: AuthErrorCode, message: string, retryAfterSeconds?: number) {
    super(message);
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Maps a raw ApiError from the server into our AuthError taxonomy.
 * TODO: confirm these status codes match your actual exception filters.
 */
function toAuthError(err: unknown): AuthError {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return new AuthError('USERNAME_TAKEN', err.message || 'That username is already taken.');
    }
    if (err.status === 404) {
      return new AuthError('USER_NOT_FOUND', err.message || 'No account found with that email.');
    }
    if (err.status === 400) {
      // class-validator's @IsEmail / @Length failures land here by default
      return new AuthError('INVALID_EMAIL', err.message || 'Please check your input.');
    }
    if (err.status === 401 || err.status === 422) {
      return new AuthError('INVALID_CODE', err.message || 'That code is incorrect. Try again.');
    }
    if (err.status === 429) {
      // TODO: confirm whether your server sends a retry-after value in
      // the body (e.g. { retryAfterSeconds: 287 }) — using that here if
      // present, otherwise falling back to a flat 5 minutes.
      const body = err.body as { retryAfterSeconds?: number } | null;
      return new AuthError(
        'RESEND_COOLDOWN',
        err.message || 'Please wait before requesting another code.',
        body?.retryAfterSeconds ?? 300
      );
    }
  }
  return new AuthError('UNKNOWN', 'Something went wrong. Please try again.');
}

export async function register(username: string, email: string): Promise<{ email: string }> {
  try {
    const dto: RegisterDto = { username, email };
    await apiClient.post('/auth/register', dto, { skipAuth: true });
    return { email };
  } catch (err) {
    throw toAuthError(err);
  }
}

export async function login(email: string): Promise<{ email: string }> {
  try {
    const dto: LoginDto = { email };
    await apiClient.post('/auth/login', dto, { skipAuth: true });
    return { email };
  } catch (err) {
    throw toAuthError(err);
  }
}

export async function resendCode(email: string): Promise<void> {
  try {
    const dto: ResendVerificationCodeDto = { email };
    await apiClient.post('/auth/resend-code', dto, { skipAuth: true });
  } catch (err) {
    throw toAuthError(err);
  }
}

export async function verifyCode(email: string, code: string): Promise<{ token: string }> {
  try {
    const dto: VerificationDto = { email, code };
    const res = await apiClient.post<VerifyResponseDTO>('/auth/verify-email', dto, {
      skipAuth: true,
    });

    await saveUserId(res.userId);
    return { token: res.token };
  } catch (err) {
    throw toAuthError(err);
  }
}

/**
 * GET /auth/check — checks if the current stored token is still valid.
 * Useful for app launch: confirm the session before trusting it blindly.
 * TODO: confirm what this actually returns (just 200/401? a user object?).
 */
export async function checkSession(): Promise<boolean> {
  try {
    await apiClient.get('/auth/check');
    return true;
  } catch {
    return false;
  }
}

/**
 * ⚠️ Not from your server — purely a client-side display helper.
 * Real cooldown enforcement happens server-side (429 responses above).
 * This just lets the Verify screen show a countdown immediately after
 * a successful send, before the next resend attempt would even hit
 * the server. TODO: if your server's 429 body includes a retryAfter
 * value, prefer that over this local estimate once confirmed.
 */
const lastSentAt = new Map<string, number>();
const LOCAL_COOLDOWN_ESTIMATE_MS = 5 * 60 * 1000;

export function getResendCooldownSeconds(email: string): number {
  const last = lastSentAt.get(email);
  if (!last) return 0;
  const elapsed = Date.now() - last;
  if (elapsed >= LOCAL_COOLDOWN_ESTIMATE_MS) return 0;
  return Math.ceil((LOCAL_COOLDOWN_ESTIMATE_MS - elapsed) / 1000);
}

export function markCodeJustSent(email: string): void {
  lastSentAt.set(email, Date.now());
}