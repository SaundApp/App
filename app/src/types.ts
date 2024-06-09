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

export type LeaderboardArtist = {
  user: User;
  position?: string;
  streams: string;
};
