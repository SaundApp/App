import { axiosClient } from "@/lib/axios";
import { getDominantColor } from "@/lib/utils";
import { Post as PostType, User } from "@/types/prisma/models";
import type {
  Album,
  Playlist,
  PlaylistedTrack,
  SimplifiedTrack,
  TrackItem,
} from "@spotify/web-api-ts-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import moment from "moment/min/moment-with-locales";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaHeart, FaRegHeart, FaSpotify } from "react-icons/fa";
import {
  FaCircleArrowLeft,
  FaCircleArrowRight,
  FaCirclePause,
  FaCirclePlay,
} from "react-icons/fa6";
import { useLongPress } from "use-long-press";
import { useSession } from "./SessionContext";
import Avatar from "./account/Avatar";
import Comments from "./drawers/Comments";
import Users from "./drawers/Users";
import Share from "./drawers/Share";
import { useInView } from "react-intersection-observer";
import { useToast } from "./ui/use-toast";

function getTrack(
  track: SimplifiedTrack | PlaylistedTrack<TrackItem> | undefined
) {
  if (!track) return null;
  if ("track" in track && !(track.track instanceof Boolean))
    return track.track as SimplifiedTrack;

  return track as SimplifiedTrack;
}

export default function Post({ post }: { post: PostType }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [saw, setSaw] = useState(false);
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<"black" | "white">("black");
  const [isPlaying, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const bind = useLongPress(() => setOpen(true));
  const imageRef = useRef<HTMLImageElement>(null);
  const player = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
  const session = useSession();
  const { ref, inView } = useInView();

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);
  useEffect(() => {
    if (imageRef.current)
      getDominantColor(imageRef.current).then((color) => {
        const luminance =
          (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;

        if (luminance > 0.6) {
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

      if (getTrack(song?.tracks.items[currentTrack])?.preview_url)
        player.current?.play();
      else {
        setPlaying(false);
        toast({
          description: t("post.no-preview"),
          variant: "destructive",
        });
      }
    } else {
      player.current?.pause();
    }
  }, [isPlaying]);
  useEffect(() => {
    if (inView && !saw) {
      axiosClient.post("/posts/" + post.id + "/see");
      setSaw(true);
    }
  }, [inView, saw]);

  const { data } = useQuery<User[]>({
    queryKey: ["posts", post.id, "likes"],
    queryFn: () =>
      axiosClient.get(`/posts/${post.id}/likes`).then((res) => res.data),
  });
  const { data: song } = useQuery<Album | Playlist>({
    queryKey: ["songs", post.id],
    queryFn: () =>
      axiosClient
        .get(
          `/songs/${post.url.split("/")[4]}?type=${post.type === "PLAYLIST" ? "playlist" : "album"}`
        )
        .then((res) => res.data)
        .then((data) => {
          if (post.type !== "PLAYLIST") return data;

          return {
            ...data,
            tracks: {
              items: data.tracks.items.filter(
                (track: any) => track.track.preview_url
              ),
            },
          };
        }),
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
          <Link to={`/account/${post.user.username}`}>
            <Avatar user={post.user} width={40} height={40} />
          </Link>

          <div>
            <Link to={`/account/${post.user.username}`}>
              <h5 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
                {post.user.name}
              </h5>
            </Link>
            <p className="muted">
              {t(`post.${post.type.toLowerCase()}`) +
                (post.type !== "SONG" ? " • " + post.name : "")}
            </p>
          </div>
        </div>

        <Link to={post.url}>
          <FaSpotify fontSize={25} />
        </Link>
      </div>

      <div className="flex flex-col gap-3 relative">
        <img
          src={post.image}
          alt={post.name}
          draggable={false}
          className="w-full rounded-2xl"
          ref={imageRef}
          crossOrigin="anonymous"
        />

        <div className="w-full h-1/2 flex flex-col justify-between absolute p-3 top-1/2">
          {post.type !== "SONG" && (
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

            <div
              ref={ref}
              className="w-fit py-3 px-6 rounded-3xl flex items-center gap-3"
              style={{
                backgroundColor: color,
                color: color === "black" ? "white" : "black",
              }}
            >
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
              <h5 className="max-w-[5rem] text-ellipsis whitespace-nowrap overflow-hidden z-10">
                {getTrack(song?.tracks.items[currentTrack])?.name || "..."}
              </h5>
            </div>
          </div>
        </div>

        <Users
          title={t("post.likes.title")}
          users={data || []}
          open={open}
          onOpenChange={setOpen}
        />
        <audio
          ref={player}
          onPause={() => {
            setPlaying(false);
          }}
        >
          {getTrack(song?.tracks.items[currentTrack])?.preview_url && (
            <source
              src={
                getTrack(song?.tracks.items[currentTrack])?.preview_url ||
                undefined
              }
            />
          )}
        </audio>
      </div>
    </div>
  );
}
