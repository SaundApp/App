import { Post } from "@/types/prisma/models";
import { Link } from "@tanstack/react-router";
import Avatar from "../account/Avatar";

export default function TopPost({
  post,
  position,
  streams,
}: {
  post: Post | undefined;
  position: string;
  streams: number;
}) {
  if (!post) return null;

  return (
    <Link
      className={
        "flex flex-col items-center " + (position !== "🥇" ? "mt-20" : "")
      }
    >
      <div className="relative mb-3">
        <Avatar imageId={post.image} width={80} height={80} />
        <p className="absolute bottom-0 w-full text-center text-xl">
          {position}
        </p>
      </div>
      <h5>{post.name}</h5>
      <p className="muted">
        {Intl.NumberFormat("en", { notation: "compact" }).format(streams)}{" "}
        streams
      </p>
    </Link>
  );
}
