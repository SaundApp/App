import { readFileSync, readdirSync } from "fs";

const locales = new Map<string, any>();
readdirSync("translations").forEach((locale) => {
  locales.set(
    locale,
    JSON.parse(readFileSync(`translations/${locale}/translation.json`, "utf-8"))
  );
});

console.log(
  `[i18n] Loaded locales (${Array.from(locales.keys()).length}):`,
  Array.from(locales.keys()).join(", ")
);

export function isLanguageSupported(language: string) {
  return locales.has(language);
}

export function getMessage(message: string, language: string = "en") {
  return locales.get(language)["notifications"][message] || message;
}
