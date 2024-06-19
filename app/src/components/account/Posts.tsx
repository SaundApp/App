import { Post } from "@/types/prisma/models";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function Posts({ posts }: { posts?: Post[] }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-3">
      {posts?.length === 0 && <p className="muted">{t("account.no_posts")}</p>}
      {posts?.map((post) => (
        <Link key={post.id} to={post.url} target="__blank">
          <img
            src={post.image}
            alt={post.name}
            width={120}
            height={120}
            draggable={false}
            className="rounded-2xl"
          />
        </Link>
      ))}
    </div>
  );
}
