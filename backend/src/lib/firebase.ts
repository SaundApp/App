import { initializeApp } from "firebase-admin/app";
import { credential } from "firebase-admin";
import { existsSync, readFileSync } from "fs";
import firebase from "firebase-admin";

const googleCredentials = existsSync("google-credentials.json")
  ? readFileSync("google-credentials.json", "utf-8")
  : null;

if (!googleCredentials) {
  console.warn(
    "[Firebase] Google credentials file not found. Returning empty firebase implementation."
  );
}

googleCredentials &&
  initializeApp({
    credential: credential.cert(JSON.parse(googleCredentials)),
  });

export default googleCredentials ? firebase : null;