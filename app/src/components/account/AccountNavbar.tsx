import { useTranslation } from "react-i18next";

export default function AccountNavbar({
  setActiveTab,
  active,
}: {
  setActiveTab: (tab: "posts" | "playlists" | "listeners") => void;
  active: "posts" | "playlists" | "listeners";
}) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between gap-3 bg-background">
      <button
        onClick={() => setActiveTab("posts")}
        className={
          "w-full " +
          (active === "posts"
            ? "border-b-2 border-b-white font-semibold"
            : undefined)
        }
      >
        Post
      </button>
      <button
        onClick={() => setActiveTab("playlists")}
        className={
          "w-full " +
          (active === "playlists"
            ? "border-b-2 border-b-white font-semibold"
            : undefined)
        }
      >
        Playlist
      </button>
      <button
        onClick={() => setActiveTab("listeners")}
        className={
          "w-full " +
          (active === "listeners"
            ? "border-b-2 border-b-white font-semibold"
            : undefined)
        }
      >
        {t("account.listeners")}
      </button>
    </div>
  );
}
