import { useTranslation } from "react-i18next";

export default function AccountNavbar({
  setActiveTab,
  active,
  listeners,
}: {
  setActiveTab: (tab: "posts" | "chats" | "listeners") => void;
  active: "posts" | "chats" | "listeners";
  listeners: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between gap-3 bg-background">
      <button
        onClick={() => setActiveTab("posts")}
        className={
          "w-full " +
          (active === "posts"
            ? "border-b-2 border-b-foreground font-semibold"
            : undefined)
        }
      >
        Post
      </button>
      <button
        onClick={() => setActiveTab("chats")}
        className={
          "w-full " +
          (active === "chats"
            ? "border-b-2 border-b-foreground font-semibold"
            : undefined)
        }
      >
        Chats
      </button>
      {listeners && (
        <button
          onClick={() => setActiveTab("listeners")}
          className={
            "w-full " +
            (active === "listeners"
              ? "border-b-2 border-b-foreground font-semibold"
              : undefined)
          }
        >
          {t("account.listener")}
        </button>
      )}
    </div>
  );
}
