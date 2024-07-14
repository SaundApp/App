import { App, type URLOpenListenerEvent } from "@capacitor/app";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function AppUrlListener() {
  const navigate = useNavigate();
  useEffect(() => {
    App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
      const url = new URL(event.url);

      navigate({
        to: url.pathname,
        search: Object.fromEntries(url.searchParams),
      });
    });
  }, [navigate]);

  return null;
}
