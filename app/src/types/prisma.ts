import type { Comment, Follows, Post, User } from "@repo/backend-common/types";

export type PublicUser = {
  id: string;
  name: string;
  username: string;
  avatarId: string | null;
  private?: boolean;
};

export type MeUser = User & {
  token?: string;
  following: Follows[];
};

export type ExtendedPost = Post & {
  comments: Comment[];
  user: PublicUser;
};

export type ExtendedComment = Comment & {
  user: PublicUser;
};
