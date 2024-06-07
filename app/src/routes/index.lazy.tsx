import Post from "@/components/Post";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-center gap-3 sticky top-0 bg-background p-3">
        <Link
          activeProps={{
            className:
              "underline underline-offset-8 decoration-2 font-semibold",
          }}
        >
          Popolari
        </Link>
        <Link>Emergenti</Link>
      </div>

      <Post
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
        createdAt={Date.now() - 1000 * 60 * 60 * 24 * 2}
        comments={10}
        url="https://i.scdn.co/image/ab67616d00001e0223f14c95a49443cb70e79f18"
        description="Ciao, sono Michele! 🚀"
        name="Da soli"
      />
    </div>
  );
}
