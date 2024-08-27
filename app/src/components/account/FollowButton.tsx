import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import type { SubscriptionSettings } from "@repo/backend-common/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSession } from "../SessionContext";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

export default function FollowButton({
  username,
  className,
}: {
  username: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  const { data } = useQuery<
    PublicUser & {
      bio: string;
      posts: number;
      followers: number;
      following: number;
      subscribed: boolean;
      subscriber: boolean;
      subscriptionSettings: SubscriptionSettings;
      verified: boolean;
      requestSent: boolean;
    }
  >({
    queryKey: ["user", username],
    queryFn: () =>
      axiosClient.get(`/users/${username}`).then((res) => res.data),
  });

  const follow = useMutation({
    mutationFn: (user: string) =>
      axiosClient
        .post(`/users/${user}/follow`)
        .then((res) => res.data)
        .then((data) => {
          if (data.request) {
            toast({
              description: t("toast.success.follow_request"),
            });
          }
        }),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", username] });
      return await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const cancelRequest = useMutation({
    mutationFn: (user: string) => axiosClient.delete(`/users/${user}/request`),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      return await queryClient.invalidateQueries({
        queryKey: ["user", username],
      });
    },
  });
  const unfollow = useMutation({
    mutationFn: (user: string) => axiosClient.delete(`/users/${user}/unfollow`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", username] });
      return await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return (
    <Button
      onClick={() => {
        if (!data) return;

        if (data.requestSent) return cancelRequest.mutate(data.id);
        if (!session?.following.find((user) => user.followingId === data.id))
          follow.mutate(data.id);
        else unfollow.mutate(data.id);
      }}
      className={className}
      variant={
        data?.requestSent && !cancelRequest.isPending
          ? "secondary"
          : follow.isPending
            ? "secondary"
            : unfollow.isPending
              ? "default"
              : !session?.following.find(
                    (user) => user.followingId === data?.id,
                  )
                ? "default"
                : "secondary"
      }
    >
      {data?.requestSent && !cancelRequest.isPending
        ? t("general.request_sent")
        : follow.isPending
          ? t("general.unfollow")
          : unfollow.isPending
            ? t("general.follow")
            : !session?.following.find((user) => user.followingId === data?.id)
              ? t("general.follow")
              : t("general.unfollow")}
    </Button>
  );
}
