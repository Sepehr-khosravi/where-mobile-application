/**
 * types/user.ts
 */

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  avatarColor: string; // fallback background color when no avatarUrl
}

export type RelationStatus = 'friend' | 'pending' | 'none';

export interface Relation {
  user: User;
  status: RelationStatus;
  lastActive?: string; // e.g. "2h ago" — purely cosmetic for the demo
}