import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <main
        className={`bg-background text-foreground font-geist py-3 px-3 min-h-screen flex flex-col`}
      >
        <Outlet />
        <Navbar />
      </main>
    </ThemeProvider>
  ),
});
