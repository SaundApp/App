import { Comment, User } from "@/types";
import moment from "moment/min/moment-with-locales";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPaperPlane, FaRegBookmark, FaRegHeart } from "react-icons/fa";
import {
  FaCircleArrowLeft,
  FaCircleArrowRight,
  FaCirclePause
} from "react-icons/fa6";
import { useLongPress } from "use-long-press";
import Comments from "./drawers/Comments";
import Likes from "./drawers/Likes";
import PostActions from "./drawers/PostActions";

export default function Post({
  user,
  comments,
  url,
  likes,
  song,
  album,
}: {
  user: User;
  comments: Comment[];
  url: string;
  likes: User[];
  song?: string;
  album?: string;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  const bind = useLongPress(() => {
    setOpen(true);
  });

  return (
    <div className="flex flex-col gap-3 relative">
      <img
        src={url}
        alt="Post image"
        draggable={false}
        className="w-full rounded-md"
      />

      <div className="w-full h-full flex flex-col justify-between absolute p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt="User avatar"
              draggable={false}
              className="w-12 h-12 rounded-md"
            />

            <div>
              <h4>{user.name}</h4>
              <p className="muted">
                {t("post.type")} • {album}
              </p>
            </div>
          </div>

          <PostActions />
        </div>

        <div className="flex justify-between">
          <FaCircleArrowLeft fontSize={25} />
          <FaCircleArrowRight fontSize={25} />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button {...bind()}>
              <FaRegHeart fontSize={25} />
            </button>
            <Comments comments={comments} />
            <FaPaperPlane fontSize={25} />
            <FaRegBookmark fontSize={25} />
          </div>

          <div className="w-fit bg-black/50 py-3 px-6 rounded-3xl flex items-center gap-3">
            <FaCirclePause fontSize={25} />
            <h4>{song}</h4>
          </div>
        </div>
      </div>

      <Likes likes={likes} open={open} onOpenChange={setOpen} />
    </div>
  );
}
