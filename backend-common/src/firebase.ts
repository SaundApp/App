import firebaseClient, { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { existsSync, readFileSync } from "node:fs";

const googleCredentials = existsSync("google-credentials.json")
  ? readFileSync("google-credentials.json", "utf-8")
  : null;

if (!googleCredentials) {
  console.warn(
    "[Firebase] Google credentials file not found. Returning empty firebase implementation.",
  );
}

googleCredentials &&
  initializeApp({
    credential: credential.cert(JSON.parse(googleCredentials)),
  });

export const firebase = googleCredentials ? firebaseClient : null;
