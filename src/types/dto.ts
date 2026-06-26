/**
 * types/dto.ts
 *
 * Request body shapes — copied 1:1 from your actual NestJS DTOs.
 * These describe what WE SEND, not what comes back (see types/api.ts
 * for response shapes, some of which are still placeholders pending
 * your confirmation — marked with TODO below).
 */

// --- Auth ---

export interface LoginDto {
  email: string;
}

export interface RegisterDto {
  username: string;
  email: string;
}

export interface ResendVerificationCodeDto {
  email: string;
}

export interface VerificationDto {
  email: string;
  code: string; // exactly 6 chars
}

// --- Relations ---

export interface AcceptInviteDto {
  inviteId: number;
}

export interface CancelInviteDto {
  inviteId: number;
}

export interface DeleteRelationDto {
  id: number;
}

export interface RejectInviteDto {
  inviteId: number;
}

export interface SendInviteDto {
  receiverId: number;
  senderId: number;
}

export interface GetUsersQueryDto {
  cursor?: number;
  limit?: number; // default 20 server-side
}

export interface SearchUsersQueryDto {
  search?: string;
  cursor?: number;
  limit?: number; // default 10 server-side
}
