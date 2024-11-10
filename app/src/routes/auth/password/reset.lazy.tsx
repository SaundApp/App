import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@repo/form-types";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";

export const Route = createLazyFileRoute("/auth/password/reset")({
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search = Route.useSearch<any>();
  const { toast } = useToast();
  const navigate = Route.useNavigate();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: search.email || "",
      token: search.token || "",
      password: "",
      confirmPassword: "",
    },
  });

  if (!search.email || !search.token) return null;

  return (
    <div className="m-auto flex flex-col justify-center gap-3">
      <div>
        <h1>{t("auth.reset_password")}</h1>
        <p className="muted">{t("auth.reset_password_description")}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => {
              axiosClient
                .post("/auth/password/reset", values)
                .then(() => {
                  toast({
                    description: t("toast.success.reset_password"),
                  });

                  navigate({
                    to: "/auth/login",
                  });
                })
                .catch(() =>
                  toast({
                    variant: "destructive",
                    description: t("toast.error.register"),
                  }),
                );
            },
            (values) => {
              const error =
                values.email ||
                values.token ||
                values.password ||
                values.confirmPassword ||
                values.root;
              toast({
                variant: "destructive",
                description: t("toast.error." + error?.message || "base"),
              });
            },
          )}
          className="flex flex-col gap-3"
        >
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-secondary"
                    placeholder={t("input.password")}
                    type="password"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            name="confirmPassword"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-secondary"
                    placeholder={t("input.password_confirm")}
                    type="password"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit">{t("auth.reset_password")}</Button>
        </form>
      </Form>
    </div>
  );
}
