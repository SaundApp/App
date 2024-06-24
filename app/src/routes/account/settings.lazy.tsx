import BackIcon from "@/components/BackIcon";
import { useSession } from "@/components/SessionContext";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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

type Checked = DropdownMenuCheckboxItemProps["checked"];

function EditProfile() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const session = useSession();
  const queryClient = useQueryClient();
  const { setTheme, theme } = useTheme();
  const [showStatusBar, setShowStatusBar] = useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = useState<Checked>(false);
  const [showPanel, setShowPanel] = useState<Checked>(false);

  const { data: languages } = useQuery<Record<string, string>>({
    queryKey: ["languages"],
    queryFn: async () => {
      const response = await fetch(new URL("/languages.json", import.meta.url));
      return response.json();
    },
  });

  if (!session) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="p-4 flex justify-center items-center relative">
        <BackIcon />
        <div className="absolute left-0 top-4 w-full h-full text-center">
          <h5 className="m-auto">{t("account.settings")}</h5>
        </div>
      </div>

      <p>{t("account.theme.title")}</p>
      <div className="flex justify-between items-center gap-3">
        <Button
          className={
            "w-full " +
            (theme === "system"
              ? "dark:bg-white dark:text-black bg-black text-white"
              : "")
          }
          variant={theme === "system" ? "default" : "outline"}
          onClick={() => setTheme("system")}
        >
          {t("account.theme.system")}
        </Button>
        <Button
          className={
            "w-full " +
            (theme === "dark"
              ? "dark:bg-white dark:text-black bg-black text-white"
              : "")
          }
          variant={theme === "dark" ? "default" : "outline"}
          onClick={() => setTheme("dark")}
        >
          {t("account.theme.dark")}
        </Button>
        <Button
          className={
            "w-full " +
            (theme === "light"
              ? "dark:bg-white dark:text-black bg-black text-white"
              : "")
          }
          variant={theme === "light" ? "default" : "outline"}
          onClick={() => setTheme("light")}
        >
          {t("account.theme.light")}
        </Button>
      </div>

      <p>{t("account.language")}</p>
      <div className="flex justify-between items-center gap-3">
        <Select
          defaultValue={i18n.language}
          onValueChange={(value) => i18n.changeLanguage(value)}
        >
          <SelectTrigger className="w-full">
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

      <div className="flex flex-col gap-1 w-full">
        <p>{t("account.notifications.title")}</p>

        <div className="grid gap-3 grid-cols-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                Likes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem
                checked={showStatusBar}
                onCheckedChange={setShowStatusBar}
              >
                Push
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showActivityBar}
                onCheckedChange={setShowActivityBar}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showPanel}
                onCheckedChange={setShowPanel}
              >
                In App
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                Likes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem
                checked={showStatusBar}
                onCheckedChange={setShowStatusBar}
              >
                Push
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showActivityBar}
                onCheckedChange={setShowActivityBar}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showPanel}
                onCheckedChange={setShowPanel}
              >
                In App
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                Likes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem
                checked={showStatusBar}
                onCheckedChange={setShowStatusBar}
              >
                Push
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showActivityBar}
                onCheckedChange={setShowActivityBar}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showPanel}
                onCheckedChange={setShowPanel}
              >
                In App
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            window.location.reload();
          }}
        >
          {t("account.actions.logout")}
        </Button>

        <Button
          variant="link"
          className="w-full bg-transparent text-destructive"
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
    </div>
  );
}
