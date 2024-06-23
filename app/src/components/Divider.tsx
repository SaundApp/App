import { useTranslation } from "react-i18next";

export default function Divider() {
  const { t } = useTranslation();
  return (
    <div className="w-full flex gap-3 justify-between items-center">
      <span className="w-full border-b border-b-[#a3a3a3] block h-1"></span>
      <p className="muted">{t("general.or")}</p>
      <span className="w-full border-b border-b-[#a3a3a3] block h-1"></span>
    </div>
  );
}
