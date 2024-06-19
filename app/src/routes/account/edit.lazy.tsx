import { useSession } from "@/components/SessionContext";
import Avatar from "@/components/account/Avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { updateSchema } from "form-types";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaChevronLeft } from "react-icons/fa";
import { z } from "zod";

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
    },
  });

  useEffect(() => {
    if (!session) return;

    form.reset({
      name: session.name,
      username: session.username,
      bio: session.bio,
      email: session.email,
    });
  }, [form, session]);

  if (!session) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="p-4 flex justify-center items-center relative">
        <Link className="mr-auto z-50" to={`/account/${session.username}`}>
          <FaChevronLeft fontSize={25} />
        </Link>
        <div className="absolute left-0 top-4 w-full h-full text-center">
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
                    description: t("account.edit_success"),
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
                description: t("account." + error?.message || "base_error"),
              });
            }
          )}
        >
          <div className="flex flex-col gap-3">
            <div className="w-full flex flex-col gap-3 items-center">
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
                            description: t("account.edit_image_success"),
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
              <Avatar user={session} width={80} height={80} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  input.current?.click();
                }}
                className="muted"
              >
                {t("account.edit_image")}
              </button>
            </div>

            <div className="flex gap-3">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Name"
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
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Username"
                        className="bg-secondary"
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
                      placeholder="Bio"
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
                      placeholder="Email"
                      className="bg-secondary"
                      type="email"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex mt-3 gap-3">
            <Button type="submit" className="w-full">
              {t("account.save")}
            </Button>

            <Button
              asChild
              className="w-full bg-transparent text-primary"
            >
              <Link>{t("account.password_change")}</Link>
            </Button>
          </div>
        </form>
      </Form>

      <p>{t("account.link")}</p>
      <div className="w-full flex flex-col gap-3">
        <Button
          className="w-full bg-[#635BFF] text-white gap-1"
          variant="default"
          asChild
        >
          <Link
            to={
              import.meta.env.VITE_API_URL +
              (session.spotifyId ? "/auth/stripe/unlink" : "/auth/stripe/link")
            }
          >
            {session.spotifyId
              ? t("account.unlink_stripe")
              : t("account.link_stripe")}
          </Link>
        </Button>

        <Button
          className="w-full bg-[#1DB954] text-white gap-1"
          variant="default"
          asChild
        >
          <Link
            to={
              import.meta.env.VITE_API_URL +
              (session.spotifyId
                ? "/auth/spotify/unlink"
                : "/auth/login/spotify")
            }
          >
            {session.spotifyId
              ? t("account.unlink_spotify")
              : t("account.link_spotify")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
