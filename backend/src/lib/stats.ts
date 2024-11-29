import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.STATS_URL,
  auth: {
    username: process.env.STATS_USERNAME!,
    password: process.env.STATS_PASSWORD!,
  },
  headers: {
    "User-Agent": `Saund-API/${process.env.npm_package_version}`,
  },
});

export async function fetchStreams(
  type: "artist",
  song: string,
): Promise<number> {
  const { data } = await axiosClient.get(
    `/${encodeURIComponent(type)}/${encodeURIComponent(song)}`,
  );

  return Number(data) || 0;
}
