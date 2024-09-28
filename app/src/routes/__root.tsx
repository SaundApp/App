import AppUrlListener from "@/components/capacitor/AppUrlListener";
import Navbar from "@/components/Navbar";
import "@/components/capacitor/SentryLoader";
import { SessionContext } from "@/components/SessionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { axiosClient } from "@/lib/axios";
import type { MeUser } from "@/types/prisma";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { SwipeBack } from "@saundapp/swipeback";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createRootRoute({
  component: App,
});

function App() {
  const navigate = Route.useNavigate();
  const routerState = useRouterState();
  const queryClient = useQueryClient();
  const { data, error, failureCount } = useQuery<MeUser | null>({
    queryKey: ["me"],
    queryFn: () =>
      localStorage.getItem("token")
        ? axiosClient.get("/auth/me").then((res) => res.data)
        : null,
    retry: 4,
    retryDelay: () => 500,
  });
  const [session, setSession] = useState<MeUser | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (data) {
      setSession(data);

      if (data.token) {
        const prev = localStorage.getItem("token");
        let tokens = JSON.parse(localStorage.getItem("tokens") || "[]");

        localStorage.setItem("token", data.token);

        if (prev) {
          tokens = tokens.filter((token: string) => token !== prev);
        }

        tokens.push(data.token);

        localStorage.setItem("tokens", JSON.stringify(tokens));
      }
    }

    if (error && failureCount > 4) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokens");
      setSession(null);
    }
  }, [data, failureCount, error]);

  useEffect(() => {
    if (token) {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    } else if (!routerState.location.pathname.startsWith("/auth")) {
      const tokens = localStorage.getItem("tokens");
      if (tokens) {
        localStorage.setItem("token", JSON.parse(tokens)[0]);
        navigate({
          to: routerState.location.pathname,
          replace: true,
        });
        return;
      }

      navigate({
        to: "/auth/login",
      });
    }
  }, [token, routerState.location.pathname, queryClient, navigate]);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  useEffect(() => {
    const allow =
      routerState.location.pathname === "/" ||
      routerState.location.pathname.startsWith("/dm") ||
      routerState.location.pathname.startsWith("/account") ||
      routerState.location.pathname.startsWith("/search");

    SwipeBack.setAllowsBackForwardNavigationGestures({
      allow,
    });
  }, [routerState.location.pathname, session?.username]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SessionContext.Provider value={session}>
        <main
          className={
            "flex h-screen min-h-screen flex-col bg-background px-3 py-6 font-geist text-foreground" +
            (Capacitor.getPlatform() === "ios" ? " !py-16" : "")
          }
        >
          <Outlet />
          {session &&
            routerState.location.pathname.match(
              /^(?!(\/dm\/\w+|\/auth)).*/g,
            ) && <Navbar />}
          <Toaster />
          <AppUrlListener />
        </main>
      </SessionContext.Provider>
    </ThemeProvider>
  );
}
