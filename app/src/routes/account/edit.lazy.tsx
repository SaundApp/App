import BackIcon from "@/components/BackIcon";
import { useSession } from "@/components/SessionContext";
import Avatar from "@/components/account/Avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSchema } from "@repo/form-types";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaSpotify, FaStripeS } from "react-icons/fa";
import type { z } from "zod";

export const Route = createLazyFileRoute("/account/edit")({
  component: EditProfile,
});

function EditProfile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();
  const input = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: session?.name || "",
      username: session?.username || "",
      bio: session?.bio || "",
      email: session?.email || "",
      private: session?.private || false,
    },
  });

  useEffect(() => {
    if (!session) return;

    form.reset({
      name: session.name,
      username: session.username,
      bio: session.bio || "",
      email: session.email,
      private: session.private,
    });
  }, [form, session]);

  if (!session) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center justify-center p-4">
        <BackIcon />
        <div className="absolute left-0 top-4 size-full text-center">
          <h5 className="m-auto">{t("account.edit_profile")}</h5>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => {
              axiosClient
                .patch("/auth/me/update", values)
                .then(() => {
                  toast({
                    description: t("toast.success.edit"),
                  });

                  queryClient.invalidateQueries({
                    queryKey: ["me"],
                  });
                })
                .catch((err) => {
                  toast({
                    description: t(err.response.data.t),
                    variant: "destructive",
                  });
                });
            },
            (values) => {
              const error =
                values.name || values.username || values.bio || values.email;
              toast({
                variant: "destructive",
                description: t("toast.error." + error?.message || "base"),
              });
            },
          )}
        >
          <div className="flex flex-col gap-3">
            <div className="flex w-full flex-col items-center gap-3">
              <input
                name="avatar"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("type", "IMAGE");

                  axiosClient
                    .post("/attachments/upload", formData)
                    .then((res) => res.data)
                    .then((data) => {
                      axiosClient
                        .patch("/auth/me/update", {
                          avatar: data.id,
                        })
                        .then(() => {
                          toast({
                            description: t("toast.success.edit_image"),
                          });

                          queryClient.invalidateQueries({
                            queryKey: ["me"],
                          });
                        });
                    });
                }}
                hidden
                ref={input}
                type="file"
                accept="image/png"
              />
              <Avatar
                user={session}
                width={80}
                height={80}
                onClick={(e) => {
                  e.preventDefault();
                  input.current?.click();
                }}
              />
            </div>

            <div className="flex w-full gap-3">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("input.name")}
                        className="bg-secondary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("input.username")}
                        className="w-full bg-secondary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="bio"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("input.bio")}
                      className="bg-secondary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("input.email")}
                      className="bg-secondary"
                      type="email"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <FormField
                name="private"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <p className="muted">{t("account.private")}</p>
            </div>
          </div>

          <div className="mt-3 flex gap-3">
            <Button type="submit" className="w-full">
              {t("account.save")}
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              type="button"
              onClick={() => {
                axiosClient
                  .post("/auth/password/forgot", { email: session.email })
                  .then(() => {
                    toast({
                      description: t("toast.success.forgot_password"),
                    });
                  });
              }}
            >
              {t("account.change_password")}
            </Button>
          </div>
        </form>
      </Form>

      <p>{t("account.manage")}</p>
      <div className="flex w-full flex-col gap-3">
        <div className="flex gap-3">
          <Button
            className="w-fit"
            onClick={() => {
              axiosClient.post("/stripe/artist/connect").then((res) => {
                window.location.href = res.data.url;
              });
            }}
          >
            <FaStripeS fontSize={20} />
          </Button>
          <Button
            className="w-fit"
            onClick={async () => {
              try {
                if (session.spotifyId) {
                  await axiosClient.post("/auth/sync/spotify");
                  toast({
                    description: t("toast.success.edit"),
                  });
                  return;
                }
              } catch (_) {
                /* empty */
              }

              window.open(
                import.meta.env.VITE_API_URL +
                  "/auth/login/spotify?token=" +
                  localStorage.getItem("token"),
                "_blank",
              );
            }}
          >
            <FaSpotify fontSize={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
