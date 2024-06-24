import BackIcon from "@/components/BackIcon";
import { useSession } from "@/components/SessionContext";
import Avatar from "@/components/account/Avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { updateSubscriptionSchema } from "form-types";
import { useEffect } from "react";
import { type FieldError, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";

export const Route = createLazyFileRoute("/account/edit-subscription")({
  component: EditSubscriptionSettings,
});

function EditSubscriptionSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();
  const { data: subscribers } = useQuery<PublicUser[]>({
    queryKey: ["subscribers"],
    queryFn: () =>
      session
        ? axiosClient
            .get(`/users/${session.id}/subscribers`)
            .then((res) => res.data)
        : [],
  });
  const form = useForm<z.infer<typeof updateSubscriptionSchema>>({
    resolver: zodResolver(updateSubscriptionSchema),
    defaultValues: {
      perks: [],
      price: 1,
    },
  });
  const perksForm = useFieldArray({
    control: form.control,
    // @ts-expect-error - Name Is correct
    name: "perks",
  });

  useEffect(() => {
    if (!session) return;

    form.reset({
      perks: session.subscriptionSettings?.perks,
      price: (session.subscriptionSettings?.price || 0) / 100,
    });
  }, [form, session]);

  if (!session) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="p-4 flex justify-center items-center relative">
        <BackIcon />
        <div className="absolute left-0 top-4 w-full h-full text-center">
          <h5 className="m-auto">{t("account.edit_profile")}</h5>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h5>{t("account.subscribers")}</h5>
        <div className="flex gap-3">
          {subscribers?.map((user) => (
            <Link
              key={user.id}
              to={`/account/${user.username}`}
              className="flex gap-3 items-center"
            >
              <Avatar user={user} width={40} height={40} />
              <div className="flex flex-col">
                <h5 className="text-left max-w-[10rem] text-ellipsis whitespace-nowrap overflow-hidden">
                  {user.name}
                </h5>
                <p className="muted text-left max-w-[10rem] text-ellipsis whitespace-nowrap overflow-hidden">
                  @{user.username}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <h5>{t("account.settings")}</h5>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => {
              axiosClient
                .patch("/auth/me/update-subscription", values)
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
              console.log(values);
              let error = (values.perks || values.price) as
                | FieldError
                | FieldError[]
                | undefined;

              if (error && "length" in error) {
                error = error[0];
              }

              toast({
                variant: "destructive",
                description: t("toast.error." + error?.message || "base"),
              });
            }
          )}
        >
          <div className="flex flex-col gap-3">
            <FormField
              name="price"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("account.price")}
                      className="bg-secondary"
                      type="number"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {perksForm.fields.map((field, index) => (
              <Input
                className="bg-secondary"
                key={field.id}
                placeholder={t("account.perk") + " #" + (index + 1)}
                {...form.register(`perks.${index}`)}
              />
            ))}
          </div>

          <div className="flex mt-3 gap-3">
            <Button type="submit" className="w-full">
              {t("account.save")}
            </Button>
            <Button
              className="w-full"
              type="button"
              onClick={() => perksForm.append("")}
              variant="secondary"
            >
              {t("account.add_perk")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
