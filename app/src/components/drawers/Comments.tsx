import { Comment } from "@/types";
import { Link } from "@tanstack/react-router";
import moment from "moment/min/moment-with-locales";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaRegHeart } from "react-icons/fa";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Input } from "../ui/input";

export default function Comments({ comments }: { comments: Comment[] }) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  return (
    <Drawer>
      <DrawerTrigger className="text-left">
        <p className="muted">
          {t("post.comments.count", { count: comments.length })}
        </p>
      </DrawerTrigger>
      <DrawerContent className="p-3 flex flex-col gap-3">
        <h4 className="font-semibold text-center">
          {t("post.comments.title")}
        </h4>

        <div className="flex flex-col gap-3">
          {comments.map((comment, index) => (
            <div key={index} className="flex gap-3 items-start">
              <img
                src={comment.user.avatar}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full"
              />

              <div>
                <div className="flex items-center gap-1">
                  <h5 className="font-semibold">{comment.user.name}</h5>
                  <p className="muted">{moment(comment.createdAt).fromNow()}</p>
                </div>

                <p>{comment.content}</p>

                <div className="flex flex-col">
                  <Link className="muted font-semibold">
                    {t("post.comments.reply")}
                  </Link>

                  <Link className="muted font-semibold">
                    {t("post.comments.see_replies", {
                      count: comment.replies.length,
                    })}
                  </Link>
                </div>
              </div>

              <FaRegHeart className="ml-auto" fontSize={25} />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-auto">
          <img
            src="https://michelemanna.me/img/logo.png"
            alt="Michele11"
            className="w-8 h-8 rounded-full"
          />
          <Input
            placeholder={t("post.comments.placeholder")}
            className="bg-secondary"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
