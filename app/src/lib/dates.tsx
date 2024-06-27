import { type Locale, formatDistanceToNow, format } from "date-fns";
import { de, enUS as en, es, fr, it, ja, pt, ru } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type DateType = string | number | Date;

const locales = { de, en, es, fr, it, jp: ja, pt, ru };

export const useDate = () => {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState<Locale>();

  useEffect(() => {
    setLocale(locales[i18n.language as never] || en);
  }, [i18n.language]);

  return {
    formatDistance: (date: DateType) =>
      formatDistanceToNow(date, {
        locale,
      }),
    format: (date: DateType, pattern: string) =>
      format(date, pattern, {
        locale,
      }),
  };
};
