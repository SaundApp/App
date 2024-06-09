import Post from "@/components/Post";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col gap-3 h-full max-h-[93vh] overflow-y-auto">
      <h1>Saund</h1>

      {Array.from({ length: 3 }).map((_, index) => (
        <Post
          key={index}
          user={{
            name: "Michele",
            username: "Michele11",
            avatar: "https://michelemanna.me/img/logo.png",
          }}
          likes={[
            {
              name: "Michele",
              username: "Michele11",
              avatar: "https://michelemanna.me/img/logo.png",
            },
          ]}
          comments={[
            {
              user: {
                name: "Michele",
                username: "Michele11",
                avatar: "https://michelemanna.me/img/logo.png",
              },
              content: "Che bello!",
              createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
              replies: [
                {
                  user: {
                    name: "Michele",
                    username: "Michele11",
                    avatar: "https://michelemanna.me/img/logo.png",
                  },
                  content: "Thanks!",
                  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
                  replies: [],
                },
              ],
            },
          ]}
          url="https://i.scdn.co/image/ab67616d00001e0223f14c95a49443cb70e79f18"
          song="Da soli"
          album="Going Hard 2"
        />
      ))}
    </div>
  );
}
