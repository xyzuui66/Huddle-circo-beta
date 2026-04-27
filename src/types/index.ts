export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  group_id: string | null;
  content: string;
  message_type: "text" | "image" | "video" | "voice" | "sticker" | "file";
  media_url: string | null;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface GlobalChatMessage {
  id: string;
  user_id: string;
  message: string;
  message_type: "text" | "image" | "video" | "voice" | "sticker";
  media_url: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "admin" | "moderator" | "member";
  joined_at: string;
  profile?: Profile;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_by: string;
  member_count: number;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  expires_at: string;
  views_count: number;
  created_at: string;
  profile?: Profile;
}

export interface Feed {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: Profile;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
  subscribers_count: number;
  created_at: string;
  owner?: Profile;
}

export interface StickerPack {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  created_by: string;
  stickers: Sticker[];
  created_at: string;
}

export interface Sticker {
  id: string;
  pack_id: string;
  url: string;
  name: string;
}

export interface Invite {
  id: string;
  type: "group" | "community";
  target_id: string;
  created_by: string;
  expires_at: string | null;
  max_uses: number | null;
  uses: number;
  code: string;
  created_at: string;
}

export type Language = "id" | "en" | "system";
export type Theme = "light" | "dark" | "system";
