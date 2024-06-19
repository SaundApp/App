import { useSession } from "@/components/SessionContext";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  FaChevronLeft,
  FaDumpsterFire,
  FaSpotify,
  FaStripeS,
} from "react-icons/fa";
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
  const session = useSession();
  const queryClient = useQueryClient();
  const { setTheme, theme } = useTheme();
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
        <Link className="mr-auto" to={`/account/${session.username}`}>
          <FaChevronLeft fontSize={25} />
        </Link>
        <div className="absolute left-0 top-4 w-full h-full text-center">
          <h5 className="m-auto">{t("account.settings")}</h5>
        </div>
      </div>

      <p>{t("account.theme.active")}</p>
      <div className="flex justify-between items-center gap-3">
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
          <Moon className="mr-3" /> {t("account.theme.dark")}
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
          <Sun className="mr-3" /> {t("account.theme.light")}
        </Button>
      </div>

      <p>{t("account.languages")}</p>
      <div className="flex justify-between items-center gap-3">
        <Select
          defaultValue={i18n.language}
          onValueChange={(value) => i18n.changeLanguage(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("account.languages")} />
          </SelectTrigger>
          <SelectContent className="z-20">
            {languages &&
              Object.keys(languages).map((lang) => (
                <SelectItem key={lang} value={lang}>
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

      <p>{t("account.actions")}</p>
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="w-full flex justify-between items-center gap-3">
            <Button
              className="w-full bg-[#1DB954] text-white gap-1"
              variant="default"
              asChild
            >
              <Link
                to={
                  import.meta.env.VITE_API_URL +
                  (session.spotifyId
                    ? "/auth/spotify/unlink"
                    : "/auth/login/spotify")
                }
              >
                <FaSpotify size={20} />
                {session.spotifyId
                  ? t("account.unlink_spotify")
                  : t("account.link_spotify")}
              </Link>
            </Button>
          </div>

          <div className="w-full flex justify-between items-center gap-3">
            <Button
              className="w-full bg-[#635BFF] text-white gap-1"
              variant="default"
              asChild
            >
              <Link
                to={
                  import.meta.env.VITE_API_URL +
                  (session.spotifyId
                    ? "/auth/stripe/unlink"
                    : "/auth/stripe/link")
                }
              >
                <FaStripeS size={20} />
                {session.spotifyId
                  ? t("account.unlink_stripe")
                  : t("account.link_stripe")}
              </Link>
            </Button>
          </div>
        </div>
        <Button
          onClick={() => {
            const token = localStorage.getItem("token");
            localStorage.clear();
            if (token) localStorage.setItem("token", token);

            queryClient.invalidateQueries();
          }}
          className="w-full gap-1"
          variant="destructive"
        >
          <FaDumpsterFire size={20} />
          {t("account.clear_cache")}
        </Button>
      </div>
    </div>
  );
}
