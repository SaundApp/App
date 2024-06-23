import AccountNavbar from "@/components/account/AccountNavbar";
import Avatar from "@/components/account/Avatar";
import Listeners from "@/components/account/Listeners";
import Posts from "@/components/account/Posts";
import BackIcon from "@/components/BackIcon";
import Accounts from "@/components/drawers/Accounts";
import Subscribe from "@/components/drawers/Subscribe";
import Users from "@/components/drawers/Users";
import { useSession } from "@/components/SessionContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { axiosClient } from "@/lib/axios";
import type { Post, SubscriptionSettings } from "backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaLock } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import type { PublicUser } from "@/types/prisma";
import { useToast } from "@/components/ui/use-toast";

export const Route = createLazyFileRoute("/account/$username")({
  component: Account,
});

function Account() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { username } = Route.useParams();
  const session = useSession();
  const [activeTab, setActiveTab] = useState<
    "posts" | "playlists" | "listeners"
  >("posts");
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingsOpen, setFollowingsOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const { data, isLoading } = useQuery<
    PublicUser & {
      bio: string;
      posts: number;
      followers: number;
      following: number;
      subscribed: boolean;
      subscriptionSettings: SubscriptionSettings;
      verified: boolean;
    }
  >({
    queryKey: ["user", username],
    queryFn: () =>
      axiosClient.get(`/users/${username}`).then((res) => res.data),
  });
  const { data: followers } = useQuery<PublicUser[]>({
    queryKey: ["followers", data?.id],
    queryFn: () =>
      data
        ? axiosClient.get(`/users/${data.id}/followers`).then((res) => res.data)
        : [],
  });
  const { data: following } = useQuery<PublicUser[]>({
    queryKey: ["following", data?.id],
    queryFn: () =>
      data
        ? axiosClient.get(`/users/${data.id}/following`).then((res) => res.data)
        : [],
  });
  const { data: posts } = useQuery<Post[]>({
    queryKey: ["posts", data?.id],
    queryFn: () =>
      data
        ? axiosClient.get(`/users/${data.id}/posts`).then((res) => res.data)
        : [],
  });
  const { data: listeners } = useQuery<PublicUser[]>({
    queryKey: ["listeners", data?.id],
    queryFn: () =>
      data
        ? axiosClient.get(`/users/${data.id}/listeners`).then((res) => res.data)
        : [],
  });
  const follow = useMutation({
    mutationFn: (user: string) =>
      axiosClient
        .post(`/users/${user}/follow`)
        .then((res) => res.data)
        .then((data) => {
          if (data.request) {
            toast({
              description: t("general.follow_request"),
            });
          }
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const unfollow = useMutation({
    mutationFn: (user: string) => axiosClient.delete(`/users/${user}/unfollow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const renderTab = () => {
    switch (activeTab) {
      case "posts":
        return (
          <Posts posts={posts?.filter((post) => post.type !== "PLAYLIST")} />
        );
      case "playlists":
        return (
          <Posts posts={posts?.filter((post) => post.type === "PLAYLIST")} />
        );
      case "listeners":
        return <Listeners listeners={listeners || []} />;
    }
  };

  useEffect(() => {
    if (activeTab === "listeners" && !listeners?.length) setActiveTab("posts");
  }, [listeners, activeTab]);

  if (isLoading) return <Spinner className="m-auto" />;
  if (!data) return null;

  const profileUnavailable =
    data.private &&
    session?.username !== data.username &&
    !session?.following.find((user) => user.followingId === data.id);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex justify-between items-center w-full">
        <div className="w-full">
          {session?.username === data.username && (
            <p className="muted">
              {!data.private ? t("account.public") : t("account.private")}
            </p>
          )}

          {session?.username === data.username && <Accounts />}

          {session?.username !== data.username && (
            <div className="p-3 flex justify-center items-center relative w-full">
              <BackIcon />
              <div className="absolute left-0 top-3 w-full h-full text-center">
                <h5 className="m-auto max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
                  {data.username}
                </h5>
              </div>
            </div>
          )}
        </div>

        {session?.username === data.username && (
          <Link to="/account/settings">
            <FaGear fontSize={20} />
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Avatar user={data} width={80} height={80} />

          <div className="flex flex-col items-center">
            <h5>{data.posts}</h5>
            <p className="muted">post</p>
          </div>

          <div className="flex flex-col items-center">
            <h5 onClick={() => !profileUnavailable && setFollowersOpen(true)}>
              {data.followers}
            </h5>
            <p className="muted">{t("account.follower")}</p>

            {followers && (
              <Users
                title={t("account.follower")}
                users={followers}
                open={followersOpen}
                onOpenChange={setFollowersOpen}
              />
            )}
          </div>

          <div className="flex flex-col items-center">
            <h5 onClick={() => !profileUnavailable && setFollowingsOpen(true)}>
              {data.following}
            </h5>
            <p className="muted">{t("account.following")}</p>

            {following && (
              <Users
                title={t("account.following")}
                users={following}
                open={followingsOpen}
                onOpenChange={setFollowingsOpen}
              />
            )}
          </div>
        </div>

        <div>
          <p className="font-semibold">{data.name}</p>
          {data.bio && <p className="muted">{data.bio}</p>}
        </div>
      </div>

      {session?.username !== data.username && (
        <div className="flex w-full gap-3">
          <Button
            onClick={() => {
              if (
                !session?.following.find((user) => user.followingId === data.id)
              )
                follow.mutate(data.id);
              else unfollow.mutate(data.id);
            }}
            className={
              !session?.following.find((user) => user.followingId === data.id)
                ? "w-full"
                : "w-full bg-secondary"
            }
          >
            {!session?.following.find((user) => user.followingId === data.id)
              ? t("general.follow")
              : t("general.unfollow")}
          </Button>
          {data.subscriptionSettings && data.verified && (
            <Button
              onClick={() => {
                if (data.subscribed) {
                  axiosClient
                    .post("/stripe/client/dashboard")
                    .then((res) => res.data)
                    .then((data) => window.open(data.url, "_blank"));
                } else setSubscribeOpen(true);
              }}
              className={!data.subscribed ? "w-full" : "w-full bg-secondary"}
            >
              {!data.subscribed
                ? t("account.subscribe")
                : t("account.edit_subscription")}
            </Button>
          )}
        </div>
      )}

      {session?.username === data.username && (
        <div className="flex w-full gap-3">
          <Button className="w-full" asChild>
            <Link to={`/account/edit`}>{t("account.edit_profile")}</Link>
          </Button>

          {data.verified && (
            <Button className="w-full" variant="secondary" asChild>
              <Link to={`/account/edit-subscription`}>
                {t("account.edit_subscription")}
              </Link>
            </Button>
          )}
        </div>
      )}

      {!profileUnavailable && (
        <>
          <AccountNavbar
            setActiveTab={setActiveTab}
            active={activeTab}
            listeners={(listeners?.length || 0) > 0}
          />
          {renderTab()}
        </>
      )}

      {profileUnavailable && (
        <div className="w-full h-full flex flex-col gap-3 items-center justify-center">
          <div className="border-4 border-black dark:border-white  rounded-full p-4">
            <FaLock size={40} />
          </div>
          <p>{t("account.private")}</p>
        </div>
      )}

      <Subscribe
        user={data}
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
      />
    </div>
  );
}
