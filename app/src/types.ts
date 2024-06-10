export type User = {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  public: boolean;
};

export type Comment = {
  user: User;
  content: string;
  createdAt: number;
  replies: Comment[];
};

export type Post = {
  url: string;
  name: string;
  song: string;
  user: User;
  likes: User[];
  comments: Comment[];
};

export type LeaderboardArtist = {
  position?: string;
  streams: string;
  user: User;
};
