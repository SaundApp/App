import { useSession } from "@/components/SessionContext";
import Avatar from "@/components/account/Avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { updateSchema } from "form-types";
import { useRef } from "react";
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
      name: session?.name,
      username: session?.username,
      bio: session?.bio,
      email: session?.email,
    },
  });

  if (!session) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="p-4 flex items-center">
        <Link to={`/account/${session.username}`}>
          <FaChevronLeft />
        </Link>
        <p className="m-auto">{t("account.edit_profile")}</p>
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
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2}>
                  <div className="w-full flex flex-col gap-3 pb-3 items-center">
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
                      className="font-bold"
                    >
                      {t("account.edit_image")}
                    </button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Name</TableCell>
                <TableCell>
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            defaultValue={session?.name}
                            className="border-none p-0 h-fit"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Username</TableCell>
                <TableCell>
                  <FormField
                    name="username"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            defaultValue={session?.username}
                            className="border-none p-0 h-fit"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Bio</TableCell>
                <TableCell>
                  <FormField
                    name="bio"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            defaultValue={session?.bio}
                            className="border-none p-0 h-fit"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Email</TableCell>
                <TableCell>
                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            defaultValue={session?.email}
                            className="border-none p-0 h-fit"
                            type="email"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Button type="submit" className="w-full">
            {t("account.save")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
