import AccountNavbar from "@/components/account/AccountNavbar";
import Listeners from "@/components/account/Listeners";
import Playlists from "@/components/account/Playlists";
import Posts from "@/components/account/Posts";
import { Button } from "@/components/ui/button";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";

export const Route = createLazyFileRoute("/account/me")({
  component: Me,
});

function Me() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "posts" | "playlists" | "listeners"
  >("posts");
  const user = {
    name: "Michele Manna",
    username: "michelemanna",
    avatar: "https://michelemanna.me/img/logo.png",
    followers: 500,
    following: 1000,
    posts: 0,
    bio: "Hello I'm Michele Manna, a full-stack developer from Italy. I love to build web applications and websites.",
    public: true,
  };
  const renderTab = () => {
    switch (activeTab) {
      case "posts":
        return <Posts />;
      case "playlists":
        return <Playlists />;
      case "listeners":
        return <Listeners />;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div>
          <p className="muted">{user.public ? "Public" : "Private"}</p>

          <div className="flex items-center gap-1">
            <h4>{user.name}</h4>
            <FaChevronDown />
          </div>
        </div>

        {/* HAMBUGER FOR SETTINGS */}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <img
            src={user.avatar}
            alt={user.name}
            draggable={false}
            className="w-20 h-20 rounded-full"
          />

          <div className="flex flex-col items-center">
            <h4>{user.posts}</h4>
            <p className="muted">post</p>
          </div>

          <div className="flex flex-col items-center">
            <h4>{user.followers}</h4>
            <p className="muted">{t("account.follower")}</p>
          </div>

          <div className="flex flex-col items-center">
            <h4>{user.following}</h4>
            <p className="muted">{t("account.following")}</p>
          </div>
        </div>

        <p className="font-semibold">{user.username}</p>
        <p className="muted">{user.bio}</p>
      </div>

      <Button className="w-full">{t("account.edit_profile")}</Button>

      <Button className="w-full" variant="secondary">
        {t("account.edit_subscription")}
      </Button>

      <AccountNavbar setActiveTab={setActiveTab} active={activeTab} />

      {renderTab()}
    </div>
  );
}
