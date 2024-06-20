import Post from "@/components/Post";
import { Spinner } from "@/components/ui/spinner";
import { axiosClient } from "@/lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { AdmobAds, AdResult } from "capacitor-admob-ads";
import { Fragment, useEffect, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import { Post as PostType } from "../types/prisma/models";
import PostAd from "@/components/PostAd";
import { Capacitor } from "@capacitor/core";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { ref, inView } = useInView();
  const [ads, setAds] = useState<AdResult[]>([]);
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery<
    PostType[]
  >({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) =>
      axiosClient.get("/posts?offset=" + pageParam).then((res) => res.data),
    initialPageParam: 0,
    getNextPageParam: (lastResult, _, lastOffset) => {
      if (lastResult.length < 10) return undefined;
      return (lastOffset as number) + 10;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage, isLoading]);
  useEffect(() => {
    if (Capacitor.getPlatform() === "web") return;

    if (data?.pages) {
      AdmobAds.loadNativeAd({
        adId: import.meta.env.VITE_ADMOB_HOME,
        adsCount: 1,
        isTesting: import.meta.env.MODE === "development",
      }).then((ads) => {
        setAds(ads.ads);
      });
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-3 h-full max-h-[92vh] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1>Saund</h1>
        <Link to="/dm">
          <FaPaperPlane fontSize={25} />
        </Link>
      </div>

      {isLoading && <Spinner className="m-auto" />}

      <div className="flex flex-col gap-6">
        {data?.pages.map((group, i) => (
          <Fragment key={i}>
            {group.map((post) => (
              <Post key={post.id} post={post} />
            ))}
            {i + 1 !== data?.pages.length &&
              ads.map((ad) => <PostAd key={ad.id} ad={ad} />)}
          </Fragment>
        ))}
      </div>

      <div ref={ref}></div>
    </div>
  );
}
