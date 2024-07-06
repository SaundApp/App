import axios from "axios";

const locales = new Map<string, any>();
if (locales.size === 0) {
  axios
    .get(`${process.env.TRANSLATIONS_URL}/api/list`)
    .then((res) => res.data)
    .then(async (list: string[]) =>
      Promise.all(
        list.map(async (locale: string) => {
          return await axios
            .get(`${process.env.TRANSLATIONS_URL}/api/download/${locale}`)
            .then((res) => res.data)
            .then((translation) => locales.set(locale, translation));
        })
      )
    )
    .then(() =>
      console.log(
        `[i18n] Loaded locales (${Array.from(locales.keys()).length}):`,
        Array.from(locales.keys()).join(", ")
      )
    );
}

export function isLanguageSupported(language: string) {
  return locales.has(language);
}

export function getMessage(message: string, language: string = "en") {
  const parts = message.split(".");

  let result = locales.get(language)["notifications"];
  for (const part of parts) {
    result = result[part];
  }

  return result || message;
}
