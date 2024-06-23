import type { Post, Comment, User, Follows } from "backend";

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
