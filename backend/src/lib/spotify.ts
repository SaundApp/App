import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import SpotifyWebApi from "spotify-web-api-node";
import prisma from "./prisma";
import { User } from "@prisma/client";

export const spotify = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!
);

export const spotifyCredentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.APP_URL + "/auth/callback/spotify",
};

export async function syncUser(user: User) {
  const spotifyToken = await prisma.spotifyToken.findFirst({
    where: { userId: user.id },
  });

  if (!spotifyToken) return false;

  const spotifyClient = new SpotifyWebApi(spotifyCredentials);
  spotifyClient.setAccessToken(spotifyToken.accessToken);
  spotifyClient.setRefreshToken(spotifyToken.refreshToken);

  if (spotifyToken.expiration < new Date()) {
    const res = await spotifyClient.refreshAccessToken();
    await prisma.spotifyToken.update({
      where: { userId: user.id },
      data: {
        accessToken: res.body.access_token,
        expiration: new Date(Date.now() + res.body.expires_in * 1000),
      },
    });
  }

  const me = await spotifyClient.getMe();
  const playlists = await spotifyClient.getUserPlaylists();
  const following = await spotifyClient.getFollowedArtists();
  const top = await spotifyClient.getMyTopArtists();
  const genres = top.body.items.map((item) => item.genres).flat();

  for (const playlist of playlists.body.items) {
    if (playlist.owner.id !== me.body.id) continue;
    if (!playlist.public) continue;

    try {
      await spotify.playlists.getPlaylist(playlist.id);
    } catch (error) {
      continue;
    }

    const exists = await prisma.post.findFirst({
      where: {
        spotifyId: playlist.id,
      },
    });

    if (exists) continue;

    await prisma.post.create({
      data: {
        name: playlist.name,
        spotifyId: playlist.id,
        userId: user.id,
        image: playlist.images[0]?.url,
        url: playlist.external_urls.spotify,
        type: "PLAYLIST",
      },
    });
  }

  for (const artist of following.body.artists.items) {
    const artistUser = await prisma.user.findFirst({
      where: {
        spotifyId: artist.id,
      },
    });

    if (artistUser) {
      await prisma.follows.create({
        data: {
          followerId: user.id,
          followingId: artistUser.id,
        },
      });
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { genres },
  });
}
