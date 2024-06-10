import Post from "@/components/Post";
import { createLazyFileRoute } from "@tanstack/react-router";
import { FaPaperPlane } from "react-icons/fa";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col gap-3 h-full max-h-[93vh] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1>Saund</h1>
        <FaPaperPlane fontSize={25} />
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <Post
          key={index}
          post={{
            user: {
              name: "Michele Manna",
              username: "michelemanna",
              avatar: "https://michelemanna.me/img/logo.png",
              followers: 0,
              following: 0,
              posts: 0,
              bio: "",
              public: true,
            },
            likes: [
              {
                name: "Michele Manna",
                username: "michelemanna",
                avatar: "https://michelemanna.me/img/logo.png",
                followers: 0,
                following: 0,
                posts: 0,
                bio: "",
                public: true,
              },
            ],
            comments: [
              {
                user: {
                  name: "Michele Manna",
                  username: "michelemanna",
                  avatar: "https://michelemanna.me/img/logo.png",
                  followers: 0,
                  following: 0,
                  posts: 0,
                  bio: "",
                  public: true,
                },
                createdAt: Date.now(),
                content: "This is a comment",
                replies: [],
              },
            ],
            url: "https://i.scdn.co/image/ab67616d00001e023c0eada9fb45ba9d43116f1d",
            name: "Going Hard 2",
            song: "Da soli",
          }}
        />
      ))}
    </div>
  );
}
