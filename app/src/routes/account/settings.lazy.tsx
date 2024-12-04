import BackIcon from "@/components/BackIcon";
import { useSession } from "@/components/SessionContext";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import type {
  NotificationMethod,
  NotificationSettings,
} from "@repo/backend-common/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaBell, FaEnvelope, FaMobile } from "react-icons/fa";
import Twemoji from "react-twemoji";

export const Route = createLazyFileRoute("/account/settings")({
  component: EditProfile,
});

const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

function EditProfile() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const session = useSession();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { setTheme, theme } = useTheme();
  const [activeTab, setActiveTab] =
    useState<Exclude<keyof NotificationSettings, "mutedChats">>("like");

  const { data: languages } = useQuery<Record<string, string>>({
    queryKey: ["languages"],
    queryFn: async () => {
      const response = await fetch(new URL("/languages.json", import.meta.url));
      return response.json();
    },
  });

  const changeSettings = useMutation({
    mutationKey: ["settings", "notifications", activeTab],
    mutationFn: (values: NotificationMethod[]) =>
      axiosClient
        .patch("/notifications/settings", {
          [activeTab]: values,
        })
        .catch((err) => {
          if (err?.response?.data?.error?.issues[0]?.message)
            toast({
              description: t(
                `toast.error.${err?.response?.data?.error?.issues[0]?.message}`,
              ),
              variant: "destructive",
            });
        }),
    onSettled: async () =>
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      }),
  });

  if (!session) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center justify-center pb-4">
        <BackIcon />
        <div className="absolute left-0 top-0 size-full text-center">
          <h5 className="m-auto">{t("account.settings")}</h5>
        </div>
      </div>

      <p>{t("account.theme.title")}</p>
      <div className="flex items-center justify-between gap-3">
        <Button
          className={
            "w-full bg-secondary " +
            (theme === "system"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "")
          }
          variant={theme === "system" ? "default" : "outline"}
          onClick={() => setTheme("system")}
        >
          {t("account.theme.system")}
        </Button>
        <Button
          className={
            "w-full bg-secondary " +
            (theme === "dark"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "")
          }
          variant={theme === "dark" ? "default" : "outline"}
          onClick={() => setTheme("dark")}
        >
          {t("account.theme.dark")}
        </Button>
        <Button
          className={
            "w-full bg-secondary " +
            (theme === "light"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "")
          }
          variant={theme === "light" ? "default" : "outline"}
          onClick={() => setTheme("light")}
        >
          {t("account.theme.light")}
        </Button>
      </div>

      <p>{t("account.language")}</p>
      <div className="flex items-center justify-between gap-3">
        <Select
          defaultValue={i18n.language}
          onValueChange={(value) => {
            i18n.changeLanguage(value);
            axiosClient.patch("/auth/me/language", {
              language: value,
            });
          }}
        >
          <SelectTrigger className="w-full bg-secondary">
            <SelectValue placeholder={t("account.language")} />
          </SelectTrigger>
          <SelectContent className="z-20">
            {languages &&
              Object.keys(languages).map((lang) => (
                <SelectItem key={lang} value={lang} className="!rounded-2xl">
                  <Twemoji options={{ className: "w-4" }}>
                    <p className="flex gap-2">
                      {getFlagEmoji(lang.replace("en", "us"))} {languages[lang]}
                    </p>
                  </Twemoji>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full flex-col">
        <p>{t("account.notifications.title")}</p>

        <div className="mt-3">
          <Select
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(
                value as Exclude<keyof NotificationSettings, "mutedChats">,
              )
            }
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="like" className="!rounded-2xl">
                  {t("account.notifications.likes")}
                </SelectItem>
                <SelectItem value="comment" className="!rounded-2xl">
                  {t("account.notifications.comments")}
                </SelectItem>
                <SelectItem value="follow" className="!rounded-2xl">
                  {t("account.notifications.follows")}
                </SelectItem>
                <SelectItem value="follow_request" className="!rounded-2xl">
                  {t("account.notifications.follow_requests")}
                </SelectItem>
                <SelectItem value="mention" className="!rounded-2xl">
                  {t("account.notifications.mentions")}
                </SelectItem>
                <SelectItem value="dm" className="!rounded-2xl">
                  {t("account.notifications.dms")}
                </SelectItem>
                <SelectItem value="leaderboard" className="!rounded-2xl">
                  {t("account.notifications.leaderboard")}
                </SelectItem>
                <SelectItem value="post" className="!rounded-2xl">
                  {t("account.notifications.new_posts")}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {activeTab && (
            <div className="mt-3 flex flex-col gap-3">
              <ToggleGroup
                type="multiple"
                className="flex justify-start"
                onValueChange={(values: NotificationMethod[]) => {
                  changeSettings.mutate(values);
                }}
                value={
                  changeSettings.isPending
                    ? changeSettings.variables
                    : session.notificationSettings[activeTab]
                }
              >
                <ToggleGroupItem
                  value="PUSH"
                  aria-label="Push toggle"
                  className="flex gap-2 rounded-2xl hover:bg-transparent hover:text-foreground"
                >
                  <FaBell className="size-4" />
                  Push
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="EMAIL"
                  aria-label="Email toggle"
                  className="flex gap-2 rounded-2xl hover:bg-transparent hover:text-foreground"
                >
                  <FaEnvelope className="size-4" />
                  Email
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="APP"
                  aria-label="App toggle"
                  className="flex gap-2 rounded-2xl hover:bg-transparent hover:text-foreground"
                >
                  <FaMobile className="size-4" />
                  In App
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
        </div>
      </div>

      <p>{t("account.actions.title")}</p>

      <div className="flex gap-3">
        <Button
          className="w-full gap-1"
          variant="destructive"
          onClick={() => {
            const token = localStorage.getItem("token");
            let tokens = JSON.parse(localStorage.getItem("tokens") || "[]");

            tokens = tokens.filter((t: string) => t !== token);
            localStorage.setItem("tokens", JSON.stringify(tokens));
            if (tokens.length > 0) localStorage.setItem("token", tokens[0]);
            else localStorage.removeItem("token");
            navigate({
              to: "/auth/login",
            });
          }}
        >
          {t("account.actions.logout")}
        </Button>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            const token = localStorage.getItem("token");
            localStorage.clear();
            if (token) {
              localStorage.setItem("token", token);
              localStorage.setItem("tokens", JSON.stringify([token]));
            }

            toast({
              description: t("toast.success.cache_cleared"),
            });

            queryClient.invalidateQueries();
          }}
        >
          {t("account.actions.cache_cleared")}
        </Button>
      </div>

      <div className="muted flex gap-1">
        <a href="https://saund.app/tos" className="underline" target="_blank">
          Terms of Service
        </a>
        <span>&</span>
        <a
          href="https://saund.app/privacy-policy"
          className="underline"
          target="_blank"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
