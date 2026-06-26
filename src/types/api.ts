// types/api.ts


// ⚠️ GET /users and /users/search are cursor-paginated (GetUsersQueryDto /
// SearchUsersQueryDto both take cursor + limit) — guessing the standard
// Nest cursor-pagination envelope shape. Confirm the actual field names.

export type inviteStatus = "ACCEPTED" | "REJECTED" | "PENDING"
export interface UserLocationDTO {
  userId: number;
  latitude: number;
  longitude: number;
  updatedAt: string; // ISO date string
}

export interface SearchedUser{
  id : number;
  email : string;
  username : string;
  inviteStatus : inviteStatus;
  isVerified : boolean;
}


export interface PaginatedUsersDTO {
  nextCursor: number | null;
  limit : number;
}

export interface PaginatedUsersResponse {
  message : string;
  users : SearchedUser[]
}



export interface CheckUserResponse{
  message : string;
  selfId : number;
}


export interface Friend {
  id: number;
  email: string;
  username: string;
}

export interface Relation {
  id: number;
  createdAt: string; // ISO string from server
  userAId: number;
  userBId: number;
  friend: Friend;
}

// Full response for GET /relations
export interface RelationDTO {
  message: 'ok';
  selfId: number;
  relations: Relation[];
}

// Full response for GET /relations/invites
export interface InvitesResponse {
  message: 'ok';
  selfId: number;
  invites: InviteDTO[];
}

// Invite DTO (adjust fields as your server sends)
export interface InviteDTO {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt : Date;
  sender : string;
}

// Response for POST /relations/invites/accept
export interface AcceptInviteResponse {
  message: 'ok';
  relationId: number;
}

// Response for POST /relations/invites/send
export interface SendInviteResponse {
  message: 'ok';
  invite: InviteDTO;
}

// Generic "ok" response for reject/cancel/delete
export interface MessageResponse {
  message: 'ok';
}

// Request DTOs (you may already have them elsewhere)
export interface SendInviteDto {
  receiverId: number;
  senderId: number;
}

export interface AcceptInviteDto {
  inviteId: number;
}

export interface RejectInviteDto {
  inviteId: number;
}

export interface CancelInviteDto {
  inviteId: number;
}

export interface DeleteRelationDto {
  id: number;
}

// User DTOs (already defined)
export interface UserProfileDTO {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  inviteStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
}

export interface UserProfile {
  id : number;
  email : string;
  username : string;
}

export interface UserProfileResponse{
  message : string;
  profile : UserProfile
}

// export interface PaginatedUsersResponse {
//   message: 'ok';
//   users: UserProfileDTO[];
//   nextCursor?: number;
// }


export interface VerifyResponseDTO{
  message : "ok";
  token : string;
  userId : number;
}

export interface GettingInviteUser{
  id : number;
  email : string;
  username : string;
}

export interface GettingInvites {
  id : number;
  senderId : number;
  receiverId : number;
  status : inviteStatus,
  createdAt : Date,
  friend : GettingInviteUser
}

export interface SentInvitesResponse {
  message : string;
  invites : GettingInvites[]
};


export interface ReceivedInvitesResponse {
  message : string;
  selfId : number;
  invites : GettingInvites[]
};