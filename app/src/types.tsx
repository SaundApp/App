export type User = {
  name: string;
  username: string;
  avatar: string;
};

export type Comment = {
  user: User;
  createdAt: number;
  content: string;
  replies: Comment[];
};