import Post from "@/components/Post";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-center gap-3 sticky top-0 bg-background p-3">
        <Link
          activeProps={{
            className:
              "underline underline-offset-8 decoration-2 font-semibold",
          }}
        >
          {t("index.popular")}
        </Link>
        <Link>{t("index.new")}</Link>
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
        name="Da soli"
      />
    </div>
  );
}
