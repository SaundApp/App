import AppUrlListener from "@/components/AppUrlListener";
import Navbar from "@/components/Navbar";
import { SessionContext } from "@/components/SessionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { axiosClient } from "@/lib/axios";
import { User } from "@/types/prisma/models";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createRootRoute({
  component: App,
});

function App() {
  const router = useRouterState();
  const queryClient = useQueryClient();
  const { data } = useQuery<
    | (User & {
        token?: string;
      })
    | null
  >({
    queryKey: ["me"],
    queryFn: () =>
      localStorage.getItem("token")
        ? axiosClient.get("/auth/me").then((res) => res.data)
        : null,
  });
  const [session, setSession] = useState<User | null>(null);

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
    if (localStorage.getItem("token")) {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    } else if (
      router.location.pathname !== "/auth/login" &&
      router.location.pathname !== "/auth/register"
    ) {
      location.href = "/auth/login";
    }
  }, [localStorage.getItem("token"), router.location.pathname, queryClient]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SessionContext.Provider value={session}>
        <main
          className={`bg-background text-foreground font-geist py-6 px-3 min-h-screen h-screen flex flex-col`}
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
