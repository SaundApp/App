import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { App, type URLOpenListenerEvent } from "@capacitor/app";

export default function AppUrlListener() {
  const navigate = useNavigate();
  useEffect(() => {
    App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
      const split = event.url.split("://");
      if (split.length > 1) {
        const path = split[1];
        const pathSplit = path.split("?");
        const to = pathSplit[0];
        const searchParams = new URLSearchParams(pathSplit[1]);

        const item = {
          to: "/" + to,
          search: Object.fromEntries(searchParams),
        };

        navigate(item);
      }
    });
  }, [navigate]);

  return null;
}
