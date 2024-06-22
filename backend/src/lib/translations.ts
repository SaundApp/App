import { readFileSync } from "fs";

const locales = new Map<string, any>();

locales.set(
  "en",
  JSON.parse(readFileSync("translations/en/translation.json", "utf-8"))
);

export function getMessage(message: string, language: string = "en") {
  return locales.get(language)["notifications"][message] || message;
}