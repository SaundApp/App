import AppUrlListener from "@/components/AppUrlListener";
import Navbar from "@/components/Navbar";
import { SessionContext } from "@/components/SessionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { axiosClient } from "@/lib/axios";
import type { MeUser } from "@/types/prisma";
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
  const router = useRouterState();
  const queryClient = useQueryClient();
  const { data } = useQuery<MeUser | null>({
    queryKey: ["me"],
    queryFn: () =>
      localStorage.getItem("token")
        ? axiosClient.get("/auth/me").then((res) => res.data)
        : null,
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
  }, [data]);

  useEffect(() => {
    if (token) {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    } else if (
      router.location.pathname !== "/auth/login" &&
      router.location.pathname !== "/auth/register"
    ) {
      const tokens = localStorage.getItem("tokens");
      if (tokens) {
        localStorage.setItem("token", JSON.parse(tokens)[0]);
        location.reload();
        return;
      }

      location.href = "/auth/login";
    }
  }, [token, router.location.pathname, queryClient]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SessionContext.Provider value={session}>
        <main
          className={`flex h-screen min-h-screen flex-col bg-background px-3 py-6 font-geist text-foreground`}
        >
          <Outlet />
          {router.location.pathname.match(/^(?!(\/dm\/\w+|\/auth)).*/g) && (
            <Navbar />
          )}
          <Toaster />
          <AppUrlListener />
        </main>
      </SessionContext.Provider>
    </ThemeProvider>
  );
}
