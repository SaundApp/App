import { axiosClient } from "@/lib/axios";
import { getDominantColor } from "@/lib/utils";
import { Post as PostType, User } from "@/types/prisma/models";
import type { Album } from "@spotify/web-api-ts-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment/min/moment-with-locales";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  FaCircleArrowLeft,
  FaCircleArrowRight,
  FaCirclePause,
  FaCirclePlay,
} from "react-icons/fa6";
import { useLongPress } from "use-long-press";
import Comments from "./drawers/Comments";
import Likes from "./drawers/Likes";
import PostActions from "./drawers/PostActions";
import { useSession } from "./SessionContext";
import Share from "./drawers/Share";

export default function Post({ post }: { post: PostType }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<"black" | "white">("black");
  const [isPlaying, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const bind = useLongPress(() => setOpen(true));
  const imageRef = useRef<HTMLImageElement>(null);
  const player = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
  const session = useSession();

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
  }, [imageRef, post.image]);

  useEffect(() => {
    if (isPlaying && player.current?.paused) {
      document
        .querySelectorAll("audio")
        .forEach((audio) => audio !== player.current && audio.pause());

      player.current?.play();
    } else {
      player.current?.pause();
    }
  }, [isPlaying]);

  const { data } = useQuery<User[]>({
    queryKey: ["posts", post.id, "likes"],
    queryFn: () =>
      axiosClient.get(`/posts/${post.id}/likes`).then((res) => res.data),
  });
  const { data: song } = useQuery<Album>({
    queryKey: ["songs", post.id],
    queryFn: () =>
      axiosClient
        .get(`/songs/${post.urls.spotify.split("/")[4]}?type=album`)
        .then((res) => res.data),
  });
  const like = useMutation({
    mutationFn: () => axiosClient.post(`/posts/${post.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", post.id, "likes"] });
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={post.user.avatarId}
            alt={post.user.username}
            draggable={false}
            className="w-10 h-10 rounded-full"
          />

          <div>
            <h4 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
              {post.user.name}
            </h4>
            <p className="muted">
              {t(`post.${post.type.toLowerCase()}`) +
                (post.type === "ALBUM" ? " • " + post.name : "")}
            </p>
          </div>
        </div>

        <PostActions color={color} urls={post.urls} />
      </div>

      <div className="flex flex-col gap-3 relative">
        <img
          src={post.image}
          alt={post.name}
          draggable={false}
          className="w-full rounded-md"
          ref={imageRef}
          crossOrigin="anonymous"
        />

        <div className="w-full h-1/2 flex flex-col justify-between absolute p-3 top-1/2">
          {post.type === "ALBUM" && (
            <div className="flex justify-between" style={{ color }}>
              <button
                onClick={() => {
                  if (currentTrack > 0) {
                    setPlaying(false);
                    setCurrentTrack((track) => track - 1);
                    player.current?.load();
                  }
                }}
              >
                <FaCircleArrowLeft fontSize={25} />
              </button>
              <button
                onClick={() => {
                  if (currentTrack < (song?.tracks.items.length || 0) - 1) {
                    setPlaying(false);
                    setCurrentTrack((track) => track + 1);
                    player.current?.load();
                  }
                }}
              >
                <FaCircleArrowRight fontSize={25} />
              </button>
            </div>
          )}

          <div
            className={
              "flex justify-between items-center " +
              (post.type === "SONG" ? "mt-auto" : "")
            }
          >
            <div className="flex items-center gap-3" style={{ color }}>
              <button {...bind()} onClick={() => like.mutate()}>
                {data?.find((user) => user.id === session?.id) ? (
                  <FaHeart fontSize={25} />
                ) : (
                  <FaRegHeart fontSize={25} />
                )}
              </button>
              <Comments post={post} />
              <Share postId={post.id} />
            </div>

            <div className="w-fit bg-black py-3 px-6 rounded-3xl flex items-center gap-3">
              <button
                onClick={() => {
                  setPlaying((playing) => !playing);
                }}
                className="z-10"
              >
                {!isPlaying ? (
                  <FaCirclePlay fontSize={25} />
                ) : (
                  <FaCirclePause fontSize={25} />
                )}
              </button>
              <h4 className="max-w-[5rem] text-ellipsis whitespace-nowrap overflow-hidden z-10">
                {song?.tracks.items[currentTrack].name || ".."}
              </h4>
            </div>
          </div>
        </div>

        <Likes likes={data || []} open={open} onOpenChange={setOpen} />
        <audio
          ref={player}
          onPause={() => {
            setPlaying(false);
          }}
        >
          {song?.tracks.items[currentTrack]?.preview_url && (
            <source
              src={song?.tracks.items[currentTrack]?.preview_url || undefined}
            />
          )}
        </audio>
      </div>
    </div>
  );
}
