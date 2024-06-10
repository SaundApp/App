import { getDominantColor } from "@/lib/utils";
import { Post as PostType } from "@/types";
import moment from "moment/min/moment-with-locales";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPaperPlane, FaRegBookmark, FaRegHeart } from "react-icons/fa";
import {
  FaCircleArrowLeft,
  FaCircleArrowRight,
  FaCirclePause,
} from "react-icons/fa6";
import { useLongPress } from "use-long-press";
import Comments from "./drawers/Comments";
import Likes from "./drawers/Likes";
import PostActions from "./drawers/PostActions";

export default function Post({ post }: { post: PostType }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<"black" | "white">("black");
  const bind = useLongPress(() => setOpen(true));
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    if (imageRef.current)
      getDominantColor(imageRef.current).then((color) => {
        const luminance =
          (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;

        if (luminance > 0.5) {
          setColor("black");
        } else {
          setColor("white");
        }
      });
  }, [imageRef, post.url]);

  return (
    <div className="flex flex-col gap-3 relative">
      <img
        src={post.url}
        alt="Post image"
        draggable={false}
        className="w-full rounded-md"
        ref={imageRef}
        crossOrigin="anonymous"
      />

      <div className="w-full h-full flex flex-col justify-between absolute p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={post.user.avatar}
              alt="User avatar"
              draggable={false}
              className="w-12 h-12 rounded-md"
            />

            <div>
              <h4 style={{ color }}>{post.user.name}</h4>
              <p className="muted">
                {t("post.type")} • {post.name}
              </p>
            </div>
          </div>

          <PostActions color={color} />
        </div>

        <div className="flex justify-between" style={{ color }}>
          <FaCircleArrowLeft fontSize={25} />
          <FaCircleArrowRight fontSize={25} />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3" style={{ color }}>
            <button {...bind()}>
              <FaRegHeart fontSize={25} />
            </button>
            <Comments comments={post.comments} />
            <FaPaperPlane fontSize={25} />
            <FaRegBookmark fontSize={25} />
          </div>

          <div className="w-fit bg-black/50 py-3 px-6 rounded-3xl flex items-center gap-3">
            <FaCirclePause fontSize={25} />
            <h4>{post.song}</h4>
          </div>
        </div>
      </div>

      <Likes likes={post.likes} open={open} onOpenChange={setOpen} />
    </div>
  );
}
