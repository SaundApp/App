import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FaChevronLeft } from "react-icons/fa";

export const Route = createLazyFileRoute("/edit/profile")({
  component: Profile,
});

function Profile() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <FaChevronLeft fontSize={25} />
        <h1>{t("edit.title")}</h1>
      </div>
    </div>
  );
}
