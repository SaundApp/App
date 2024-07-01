import { axiosClient } from "@/lib/axios";
import { getDominantColor } from "@/lib/utils";
import type { ExtendedPost } from "@/types/prisma";
import type { Chat, User } from "@repo/backend-common/types";
import type {
  Album,
  Playlist,
  PlaylistedTrack,
  SimplifiedTrack,
  TrackItem,
} from "@spotify/web-api-ts-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaHeart, FaPaperPlane, FaRegHeart, FaSpotify } from "react-icons/fa";
import {
  FaCircleArrowLeft,
  FaCircleArrowRight,
  FaCirclePause,
  FaCirclePlay,
} from "react-icons/fa6";
import { useInView } from "react-intersection-observer";
import { useLongPress } from "use-long-press";
import { useSession } from "./SessionContext";
import Avatar from "./account/Avatar";
import Comments from "./drawers/Comments";
import Share from "./drawers/FindUser";
import Users from "./drawers/Users";
import { useToast } from "./ui/use-toast";

function getTrack(
  track: SimplifiedTrack | PlaylistedTrack<TrackItem> | undefined,
) {
  if (!track) return null;
  if ("track" in track && !(track.track instanceof Boolean))
    return track.track as SimplifiedTrack;

  return track as SimplifiedTrack;
}

export default function Post({ post }: { post: ExtendedPost }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
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
          `/songs/${post.url.split("/")[4]}?type=${post.type === "PLAYLIST" ? "playlist" : "album"}`,
        )
        .then((res) => res.data)
        .then((data) => {
          if (post.type !== "PLAYLIST") return data;

          return {
            ...data,
            tracks: {
              items: data.tracks.items.filter(
                (track: { track: { preview_url: string } }) =>
                  track.track.preview_url,
              ),
            },
          };
        }),
  });
  const like = useMutation({
    mutationFn: (isLike: boolean) =>
      axiosClient.post(`/posts/${post.id}/like`, { isLike }),
    onSettled: async () =>
      await queryClient.invalidateQueries({
        queryKey: ["posts", post.id, "likes"],
      }),
  });

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
  }, [imageRef, post.image, song]);
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
          description: t("toast.error.no_preview"),
          variant: "destructive",
        });
      }
    } else {
      player.current?.pause();
    }
  }, [currentTrack, isPlaying, song?.tracks.items, t, toast]);
  useEffect(() => {
    if (inView && !saw) {
      axiosClient.post("/posts/" + post.id + "/see");
      setSaw(true);
    }
  }, [inView, post.id, saw]);

  if (!song) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/account/${post.user.username}`}>
            <Avatar user={post.user} width={40} height={40} />
          </Link>

          <div>
            <Link to={`/account/${post.user.username}`}>
              <h5 className="max-w-40 truncate text-left">{post.user.name}</h5>
            </Link>
            <p className="muted max-w-40 truncate text-left">
              {t(`index.${post.type.toLowerCase()}`) +
                (post.type !== "SONG" ? " • " + post.name : "")}
            </p>
          </div>
        </div>

        <Link to={post.url}>
          <FaSpotify fontSize={25} />
        </Link>
      </div>

      <div className="relative flex flex-col gap-3">
        <img
          src={post.image}
          alt={post.name}
          draggable={false}
          className="aspect-square size-full rounded-2xl object-cover"
          ref={imageRef}
          crossOrigin="anonymous"
          height={390}
          width={390}
        />

        <div className="absolute top-1/2 flex h-1/2 w-full flex-col justify-between p-3">
          {post.type !== "SONG" && (
            <div className="flex justify-between" style={{ color }}>
              {currentTrack > 0 && (
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
              )}
              {currentTrack < (song?.tracks.items.length || 0) - 1 && (
                <button
                  onClick={() => {
                    if (currentTrack < (song?.tracks.items.length || 0) - 1) {
                      setPlaying(false);
                      setCurrentTrack((track) => track + 1);
                      player.current?.load();
                    }
                  }}
                  className="ml-auto"
                >
                  <FaCircleArrowRight fontSize={25} />
                </button>
              )}
            </div>
          )}

          <div
            className={
              "flex items-center justify-between " +
              (post.type === "SONG" ? "mt-auto" : "")
            }
          >
            <div className="flex items-center gap-3" style={{ color }}>
              <button
                {...bind()}
                onClick={() =>
                  like.mutate(!data?.find((user) => user.id === session?.id))
                }
              >
                {(
                  like.isPending
                    ? like.variables
                    : data?.find((user) => user.id === session?.id)
                ) ? (
                  <FaHeart fontSize={25} />
                ) : (
                  <FaRegHeart fontSize={25} />
                )}
              </button>
              <Comments post={post} />
              <Share
                onClick={async (user) => {
                  const { data } = await axiosClient.post<Chat>(
                    "/dm/create?upsert=true",
                    {
                      name: user.username,
                      userIds: [user.id],
                      imageId: user.avatarId
                    },
                  );

                  if (data)
                    navigate({
                      to: "/dm/" + data.id,
                      search: {
                        text: `${import.meta.env.VITE_APP_URL}/?post=${post.id}`,
                        submit: true,
                      },
                    });

                  return true;
                }}
              >
                <button>
                  <FaPaperPlane fontSize={25} />
                </button>
              </Share>
            </div>

            <div
              ref={ref}
              className="flex w-fit items-center gap-3 rounded-3xl px-6 py-3"
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
              <h5 className="z-10 max-w-20 truncate">
                {getTrack(song?.tracks.items[currentTrack])?.name || "..."}
              </h5>
            </div>
          </div>
        </div>

        <Users
          title={t("index.likes.title")}
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
