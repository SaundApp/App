import { Comment, User } from "@/types";
import moment from "moment/min/moment-with-locales";
import { useTranslation } from "react-i18next";
import { BsBookmarkFill } from "react-icons/bs";
import { FaRegHeart, FaRegPaperPlane } from "react-icons/fa";
import Comments from "./drawers/Comments";
import Likes from "./drawers/Likes";
import PostActions from "./drawers/PostActions";
import { Button } from "./ui/button";
import { useEffect } from "react";

export default function Post({
  user,
  createdAt,
  comments,
  url,
  likes,
  name,
}: {
  user: User;
  createdAt: number;
  comments: Comment[];
  url: string;
  name: string;
  likes: User[];
}) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.username}
            draggable={false}
            className="w-10 h-10 rounded-full"
          />

          <div>
            <h4 className="font-semibold">{user.name}</h4>
            <p className="muted">{moment(createdAt).fromNow()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button>{t("general.follow")}</Button>
          <PostActions />
        </div>
      </div>

      <div className="relative">
        <img
          src={url}
          alt="Post image"
          draggable={false}
          className="w-full rounded-md blur-sm"
        />
        <img
          src={url}
          alt="Post image"
          draggable={false}
          className="w-1/2 h-1/2 animate-spin-disk rounded-full absolute top-1/4 left-1/4"
        />

        <div
          className="absolute w-full text-center"
          style={{
            bottom: "calc(25% - 45px)",
          }}
        >
          <h2 className="text-white">{name}</h2>
        </div>

        <span
          className="h-2 bg-black/30 block rounded-md absolute bottom-4 left-4"
          style={{ width: "calc(100% - 2rem)" }}
        />
        <span className="h-2 bg-white block rounded-md absolute bottom-4 left-4 w-1/3" />
      </div>

      <div className="flex justify-between">
        <div className="flex gap-3">
          <FaRegHeart fontSize={25} />
          <FaRegPaperPlane fontSize={25} />
        </div>

        <BsBookmarkFill fontSize={25} />
      </div>

      <Likes likes={likes} />

      <Comments comments={comments} />
    </div>
  );
}
