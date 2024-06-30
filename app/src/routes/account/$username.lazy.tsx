import BackIcon from "@/components/BackIcon";
import { useSession } from "@/components/SessionContext";
import AccountNavbar from "@/components/account/AccountNavbar";
import Avatar from "@/components/account/Avatar";
import Listeners from "@/components/account/Listeners";
import Posts from "@/components/account/Posts";
import Accounts from "@/components/drawers/Accounts";
import Subscribe from "@/components/drawers/Subscribe";
import Users from "@/components/drawers/Users";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import type {
  Chat,
  Post,
  SubscriptionSettings,
} from "@repo/backend-common/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { LucideHeartHandshake } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaGear } from "react-icons/fa6";
import Hammer from "hammerjs";
import Chats from "@/components/account/Chats";

export const Route = createLazyFileRoute("/account/$username")({
  component: Account,
});

function Account() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { username } = Route.useParams();
  const session = useSession();
  const [activeTab, setActiveTab] = useState<"posts" | "chats" | "listeners">(
    "posts",
  );
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingsOpen, setFollowingsOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useQuery<
    PublicUser & {
      bio: string;
      posts: number;
      followers: number;
      following: number;
      subscribed: boolean;
      subscriber: boolean;
      subscriptionSettings: SubscriptionSettings;
      verified: boolean;
      requestSent: boolean;
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
  const { data: chats } = useQuery<Chat[]>({
    queryKey: ["chats", data?.id],
    queryFn: () =>
      data
        ? axiosClient.get(`/users/${data.id}/chats`).then((res) => res.data)
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
              description: t("toast.success.follow_request"),
            });
          }
        }),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", username] });
      return await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const cancelRequest = useMutation({
    mutationFn: (user: string) => axiosClient.delete(`/users/${user}/request`),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      return await queryClient.invalidateQueries({
        queryKey: ["user", username],
      });
    },
  });
  const unfollow = useMutation({
    mutationFn: (user: string) => axiosClient.delete(`/users/${user}/unfollow`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", username] });
      return await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const renderTab = () => {
    switch (activeTab) {
      case "posts":
        return <Posts posts={posts} />;
      case "chats":
        return <Chats chats={chats || []} />;
      case "listeners":
        return <Listeners listeners={listeners || []} />;
    }
  };

  useEffect(() => {
    if (activeTab === "listeners" && !listeners?.length) setActiveTab("posts");
  }, [listeners, activeTab]);

  useEffect(() => {
    if (!tabRef.current) return;

    const hammer = new Hammer(tabRef.current);

    hammer.on("panleft panright", (ev) => {
      if (ev.type === "panleft") {
        if (activeTab === "posts") setActiveTab("chats");
        if (activeTab === "chats") setActiveTab("listeners");
      } else {
        if (activeTab === "chats") setActiveTab("posts");
        if (activeTab === "listeners") setActiveTab("chats");
      }
    });

    return () => hammer.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabRef.current, activeTab]);

  if (isLoading) return <Spinner className="m-auto" />;
  if (!data) return null;

  const profileUnavailable =
    data.private &&
    session?.username !== data.username &&
    !session?.following.find((user) => user.followingId === data.id);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex w-full items-center justify-between">
        <div className="w-full">
          {session?.username === data.username && (
            <p className="muted">
              {!data.private ? t("account.public") : t("account.private")}
            </p>
          )}

          {session?.username === data.username && <Accounts />}

          {session?.username !== data.username && (
            <div className="relative flex w-full items-center justify-center p-3">
              <BackIcon />
              <div className="absolute left-0 top-3 size-full text-center">
                <h5 className="m-auto max-w-56 truncate">{data.username}</h5>
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

          <div
            className="flex flex-col items-center"
            onClick={() => !profileUnavailable && setFollowersOpen(true)}
          >
            <h5>{data.followers}</h5>
            <p className="muted">{t("account.follower")}</p>

            {followers && (
              <Users
                title={t("account.follower")}
                users={followers}
                open={followersOpen}
                onOpenChange={setFollowersOpen}
                isFollowers
                userId={data.id}
              />
            )}
          </div>

          <div
            className="flex flex-col items-center"
            onClick={() => !profileUnavailable && setFollowingsOpen(true)}
          >
            <h5>{data.following}</h5>
            <p className="muted">{t("account.following")}</p>

            {following && (
              <Users
                title={t("account.following")}
                users={following}
                open={followingsOpen}
                onOpenChange={setFollowingsOpen}
                userId={data.id}
              />
            )}
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1 font-semibold">
            {data.name} {data.subscriber && <LucideHeartHandshake size="20" />}
          </p>
          {data.bio && <p className="muted">{data.bio}</p>}
        </div>
      </div>

      {session?.username !== data.username && (
        <div className="flex w-full gap-3">
          <Button
            onClick={() => {
              if (data.requestSent) return cancelRequest.mutate(data.id);
              if (
                !session?.following.find((user) => user.followingId === data.id)
              )
                follow.mutate(data.id);
              else unfollow.mutate(data.id);
            }}
            className={
              data.requestSent && !cancelRequest.isPending
                ? "w-full bg-secondary"
                : follow.isPending
                  ? "w-full bg-secondary"
                  : unfollow.isPending
                    ? "w-full"
                    : !session?.following.find(
                          (user) => user.followingId === data.id,
                        )
                      ? "w-full"
                      : "w-full bg-secondary"
            }
          >
            {data.requestSent && !cancelRequest.isPending
              ? t("general.request_sent")
              : follow.isPending
                ? t("general.unfollow")
                : unfollow.isPending
                  ? t("general.follow")
                  : !session?.following.find(
                        (user) => user.followingId === data.id,
                      )
                    ? t("general.follow")
                    : t("general.unfollow")}
          </Button>
          {data.subscriptionSettings &&
            data.verified &&
            !profileUnavailable && (
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
          <div ref={tabRef} className="flex size-full flex-col">
            {renderTab()}
          </div>
        </>
      )}

      {profileUnavailable && (
        <div className="flex size-full flex-col items-center justify-center">
          <h5>{t("account.private")}</h5>
          <p className="muted">{t("account.private_description")}</p>
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
