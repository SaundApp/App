import { useTranslation } from "react-i18next";

export default function Divider() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="block h-1 w-full border-b border-b-neutral-400"></span>
      <p className="muted">{t("general.or")}</p>
      <span className="block h-1 w-full border-b border-b-neutral-400"></span>
    </div>
  );
}
