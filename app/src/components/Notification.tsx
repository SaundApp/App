import { Link } from "@tanstack/react-router";
import moment from "moment/min/moment-with-locales";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

export default function Notification({
  image,
  children: text,
  timestamp,
  button,
}: {
  image: string;
  children: React.ReactElement | string;
  timestamp: number;
  button?: {
    text: string;
    href: string;
  };
}) {
  const { i18n } = useTranslation();

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  return (
    <div className="flex flex-row gap-3 w-full items-center">
      <img
        src={image}
        alt="Michele"
        draggable={false}
        className="w-10 h-10 rounded-full"
      />

      <div>
        <h4>{text}</h4>
        <p className="muted">{moment(timestamp).fromNow()}</p>
      </div>

      {button && (
        <Button className="ml-auto" asChild>
          <Link href={button.href}>{button.text}</Link>
        </Button>
      )}
    </div>
  );
}
