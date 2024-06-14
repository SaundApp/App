import Navbar from "@/components/Navbar";
import { SessionContext } from "@/components/SessionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  const { data } = useQuery<User>({
    queryKey: ["me"],
    queryFn: () => axiosClient.get("/auth/me").then((res) => res.data),
  });
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    if (data) {
      setSession(data);
    }
  }, [data]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  }, [localStorage.getItem("token")]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SessionContext.Provider value={session}>
        <main
          className={`bg-background text-foreground font-geist py-3 px-3 min-h-screen h-screen flex flex-col`}
        >
          <Outlet />
          {router.location.pathname.match(/^(?!\/dm\/\w+).*/g) && <Navbar />}
        </main>
      </SessionContext.Provider>
    </ThemeProvider>
  );
}
