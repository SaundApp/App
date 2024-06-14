import Post from "@/components/Post";
import { axiosClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { Post as PostType } from "../types/prisma/models";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  // TODO: Pagination
  const [page] = useState(0);
  const { data } = useQuery<PostType[]>({
    queryKey: ["posts", page],
    queryFn: () => axiosClient.get("/posts").then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-3 h-full max-h-[93vh] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1>Saund</h1>
        <Link to="/dm">
          <FaPaperPlane fontSize={25} />
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {data?.map((post) => <Post key={post.id} post={post} />)}
      </div>
    </div>
  );
}
