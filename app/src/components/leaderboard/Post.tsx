import { Post as PostType } from "@/types/prisma/models";
import { Link } from "@tanstack/react-router";
import Avatar from "../account/Avatar";

export default function Post({
  post,
  position,
  description,
  onClick,
}: {
  post: PostType;
  position?: number;
  description?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to={post.url}
      className="flex flex-row gap-3 w-full items-center"
      onClick={onClick}
    >
      <Avatar imageId={post.image} width={40} height={40} />
      <div>
        <h5>{post.name}</h5>
        {description && <p className="muted">{description}</p>}
      </div>
      {position && <p className="ml-auto">{position}°</p>}
    </Link>
  );
}
