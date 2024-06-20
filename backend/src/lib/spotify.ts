import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import SpotifyWebApi from "spotify-web-api-node";
import prisma from "./prisma";

export const spotify = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!
);

export const spotifyCredentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.APP_URL + "/auth/callback/spotify",
};

export async function syncUser(userId: string) {
  const spotifyToken = await prisma.spotifyToken.findFirst({
    where: { userId },
  });

  if (!spotifyToken) return false;

  const spotifyClient = new SpotifyWebApi(spotifyCredentials);
  spotifyClient.setAccessToken(spotifyToken.accessToken);
  spotifyClient.setRefreshToken(spotifyToken.refreshToken);

  if (spotifyToken.expiration < new Date()) {
    const res = await spotifyClient.refreshAccessToken();
    await prisma.spotifyToken.update({
      where: { userId },
      data: {
        accessToken: res.body.access_token,
        expiration: new Date(Date.now() + res.body.expires_in * 1000),
      },
    });
  }

  
}
