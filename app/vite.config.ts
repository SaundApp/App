import { sentryVitePlugin } from "@sentry/vite-plugin";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import path from "path";
import Unfonts from "unplugin-fonts/vite";
import { defineConfig, loadEnv } from "vite";

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [
      react(),
      TanStackRouterVite(),
      Unfonts({
        custom: {
          families: [
            {
              name: "Geist",
              src: "./node_modules/geist/dist/fonts/geist-*/*.woff2",
            },
          ],
        },
      }),
      sentryVitePlugin({
        org: "saund",
        project: "app",
        telemetry: false,
      }),
      {
        name: "i18n-bundler",
        async closeBundle() {
          if (existsSync("dist/locales"))
            rmSync("dist/locales", { recursive: true, force: true });
          mkdirSync("dist/locales", { recursive: true });

          const data: string[] = await fetch(
            `${process.env.VITE_TRANSLATIONS_URL}/api/list`,
          ).then((res) => res.json());

          for (const locale of data) {
            const localeData = await fetch(
              `${process.env.VITE_TRANSLATIONS_URL}/api/download/${locale}`,
            ).then((res) => res.json());

            writeFileSync(
              `dist/locales/${locale}.json`,
              JSON.stringify(localeData),
            );
          }

          console.log(`i18n-bundler: Bundled ${data.length} translations`);
        },
      },
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      sourcemap: true,
    },
  });
};
