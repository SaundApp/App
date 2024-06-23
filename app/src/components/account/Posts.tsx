import type { Post } from "backend";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function Posts({ posts }: { posts?: Post[] }) {
  const { t } = useTranslation();

  return (
    <div className="h-full max-h-[80vh] overflow-y-auto">
      {posts?.length === 0 && <p className="muted">{t("account.no_posts")}</p>}
      <div className="grid grid-cols-3 gap-3">
        {posts?.map((post) => (
          <Link key={post.id} to={post.url} target="_blank">
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
    </div>
  );
}
