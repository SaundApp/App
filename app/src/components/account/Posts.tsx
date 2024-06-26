import type { Post } from "@repo/backend-common/types";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function Posts({ posts }: { posts?: Post[] }) {
  const { t } = useTranslation();

  return (
    <div className="h-full max-h-[60vh] overflow-y-auto">
      {posts?.length === 0 && (
        <div className="flex size-full flex-col items-center justify-center">
          <h5>{t("general.empty")}</h5>
          <p className="muted text-center">{t("general.empty_description")}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {posts?.map((post) => (
          <Link key={post.id} to={post.url} target="_blank">
            <img
              src={post.image}
              alt={post.name}
              width={120}
              height={120}
              draggable={false}
              className="size-[120px] rounded-2xl object-cover"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
