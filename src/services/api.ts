/**
 * services/api.ts
 *
 * Real implementation against your NestJS UserController:
 *   GET  /users          (paginated list, GetUsersQueryDto: cursor, limit)
 *   POST /users/search    (note: POST, not GET — SearchUsersQueryDto: search, cursor, limit)
 *
 * ⚠️ Two things to confirm with you:
 *  1. /users/search is mapped as POST in your router log, but
 *     SearchUsersQueryDto looks like query-string params (cursor/limit
 *     with @Type(() => Number), which is the @Query() decorator
 *     pattern). Sending it as a JSON body for now since the route is
 *     POST — flag if it should actually be query params on the URL.
 *  2. There's no GET /users/:id in your route list — only GET /users
 *     (list) and POST /users/search. For now getUserProfile() filters
 *     client-side from a search-by-nothing call, which is wasteful.
 *     Let me know the right way to fetch a single user by id once you
 *     have/confirm that route.
 */

import { PaginatedUsersResponse, UserProfileDTO, UserProfileResponse } from '../types/api';
import { GetUsersQueryDto, SearchUsersQueryDto } from '../types/dto';
import { apiClient } from './apiClient';

export async function getUsers(query: GetUsersQueryDto = {}): Promise<PaginatedUsersResponse> {
  const params = new URLSearchParams();
  if (query.cursor != null) params.set('cursor', String(query.cursor));
  if (query.limit != null) params.set('limit', String(query.limit));
  const qs = params.toString();
  return apiClient.get<PaginatedUsersResponse>(`/users${qs ? `?${qs}` : ''}`);
}

export async function searchUsers(search: string, query: Omit<SearchUsersQueryDto, 'search'> = {}): Promise<PaginatedUsersResponse> {
  const dto: SearchUsersQueryDto = { search, ...query };
  return apiClient.post<PaginatedUsersResponse>('/users/search', dto);
}




/**
 * ⚠️ TEMPORARY — see file header note #2. No confirmed single-user
 * endpoint exists yet. This is NOT efficient (fetches the whole first
 * page and filters client-side) and should be replaced the moment you
 * confirm a real GET /users/:id (or similar) route.
 */
export async function getUserProfile(userId: string): Promise<UserProfileDTO> {
  const page = await getUsers({ limit: 50 });
  const found = page.users.find((u) => String(u.id) === userId);
  if (!found) {
    throw new Error(`No user with id ${userId} found in first page (temporary lookup limitation)`);
  }
  return found;
}


export async function getUser(userId:number) : Promise<UserProfileResponse> {
  return apiClient.get<UserProfileResponse>("/users/self")
}