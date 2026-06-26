// services/relations.ts

import {
  AcceptInviteDto,
  AcceptInviteResponse,
  CancelInviteDto,
  DeleteRelationDto,
  InviteDTO,
  InvitesResponse,
  MessageResponse,
  ReceivedInvitesResponse,
  RejectInviteDto,
  RelationDTO,
  SendInviteDto,
  SendInviteResponse,
  SentInvitesResponse,
} from '../types/api';
import { apiClient } from './apiClient';

/**
 * GET /relations – returns { selfId, relations[] }
 */
export async function getRelations(): Promise<{ selfId: number; relations: RelationDTO['relations'] }> {
  const data = await apiClient.get<RelationDTO>('/relations');
  return { selfId: data.selfId, relations: data.relations };
}

export async function getSentInvites() : Promise<SentInvitesResponse> {
  return apiClient.get<SentInvitesResponse>("/relations/invites/sent", {
    skipAuth : false,
  });
}

export async function getReceivedInvites() : Promise<ReceivedInvitesResponse> {
  return apiClient.get<ReceivedInvitesResponse>("/relations/invites", {
    skipAuth : false
  });
};

/**
 * GET /relations/invites – returns { selfId, invites[] }
 */
export async function getInvites(): Promise<{ selfId: number; invites: InviteDTO[] }> {
  const data = await apiClient.get<InvitesResponse>('/relations/invites');
  return { selfId: data.selfId, invites: data.invites };
}

/**
 * POST /relations/invites/send – returns the created invite
 */
export async function sendInvite(receiverId: number, senderId: number): Promise<SendInviteResponse> {
  const dto: SendInviteDto = { receiverId, senderId };
  const data = await apiClient.post<SendInviteResponse>('/relations/invites/send', dto);
  return data;
}

/**
 * POST /relations/invites/accept – returns the new relationId
 */
export async function acceptInvite(inviteId: number): Promise<number> {
  const dto: AcceptInviteDto = { inviteId };
  const data = await apiClient.post<AcceptInviteResponse>('/relations/invites/accept', dto);
  return data.relationId;
}

/**
 * POST /relations/invites/reject – just an ok message
 */
export async function rejectInvite(inviteId: number): Promise<void> {
  const dto: RejectInviteDto = { inviteId };
  await apiClient.post<MessageResponse>('/relations/invites/reject', dto);
}

/**
 * POST /relations/invites/cancel – just an ok message
 */
export async function cancelInvite(inviteId: number): Promise<void> {
  const dto: CancelInviteDto = { inviteId };
  await apiClient.post<MessageResponse>('/relations/invites/cancel', dto);
}

/**
 * DELETE /relations/delete – just an ok message
 */
export async function deleteRelation(id: number): Promise<void> {
  const dto: DeleteRelationDto = { id };
  await apiClient.delete<MessageResponse>('/relations/delete', dto);
}

