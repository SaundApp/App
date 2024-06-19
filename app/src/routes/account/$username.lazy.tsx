import AccountNavbar from "@/components/account/AccountNavbar";
import Avatar from "@/components/account/Avatar";
import Listeners from "@/components/account/Listeners";
import Posts from "@/components/account/Posts";
import Users from "@/components/drawers/Users";
import { useSession } from "@/components/SessionContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { axiosClient } from "@/lib/axios";
import { Post, User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

export const Route = createLazyFileRoute("/account/$username")({
  component: Account,
});

function Account() {
  const { t } = useTranslation();
  const { username } = Route.useParams();
  const session = useSession();
  const [activeTab, setActiveTab] = useState<
    "posts" | "playlists" | "listeners"
  >("posts");
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingsOpen, setFollowingsOpen] = useState(false);
  const { data, isLoading } = useQuery<
    User & {
      posts: number;
      followers: number;
      following: number;
    }
  >({
    queryKey: ["user", username],
    queryFn: () =>
      axiosClient.get(`/users/${username}`).then((res) => res.data),
  });
  const { data: followers } = useQuery<User[]>({
    queryKey: ["followers", data?.id],
    queryFn: () =>
      data
        ? axiosClient.get(`/users/${data.id}/followers`).then((res) => res.data)
        : [],
  });
  const { data: following } = useQuery<User[]>({
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
        return <Listeners />;
    }
  };

  if (isLoading) return <Spinner className="m-auto" />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div>
          <p className="muted">{!data.private ? "Public" : "Private"}</p>

          <div className="flex items-center gap-1">
            <h5>{data.username}</h5>
            <FaChevronDown fontSize={20} />
          </div>
        </div>

        <Link to="/account/settings">
          <FaGear fontSize={20} />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Avatar user={data} width={80} height={80} />

          <div className="flex flex-col items-center">
            <h5>{data.posts}</h5>
            <p className="muted">post</p>
          </div>

          <div className="flex flex-col items-center">
            <h5 onClick={() => setFollowersOpen(true)}>{data.followers}</h5>
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
            <h5 onClick={() => setFollowingsOpen(true)}>{data.following}</h5>
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

        <p className="font-semibold">{data.name}</p>
        <p className="muted">{data.bio}</p>
      </div>

      {session?.username === data.username && (
        <>
          <Button className="w-full" asChild>
            <Link to={`/account/edit`}>{t("account.edit_profile")}</Link>
          </Button>

          <Button className="w-full" variant="secondary">
            {t("account.edit_subscription")}
          </Button>
        </>
      )}

      {!data.private && (
        <AccountNavbar setActiveTab={setActiveTab} active={activeTab} />
      )}

      {renderTab()}
    </div>
  );
}
