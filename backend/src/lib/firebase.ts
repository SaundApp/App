import { initializeApp } from "firebase-admin/app";
import { credential } from "firebase-admin";
import { readFileSync } from "fs";
import firebase from "firebase-admin";

const googleCredentials = readFileSync("google-credentials.json", "utf-8");

initializeApp({
  credential: credential.cert(JSON.parse(googleCredentials)),
});

export default firebase;