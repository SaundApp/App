import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@repo/form-types";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";

export const Route = createLazyFileRoute("/auth/password/reset")({
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useTranslation();
  const { email, token } = Route.useSearch<{
    email: string | undefined;
    token: string | undefined;
  }>();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email || "",
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  if (!email || !token) return null;

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

                  location.href = "/auth/login";
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

          <div className="flex items-center justify-between">
            <Link to="/auth/login" className="flex items-center gap-1">
              <p className="muted">Login</p>
            </Link>
          </div>

          <Button type="submit">{t("auth.reset_password")}</Button>
        </form>
      </Form>
    </div>
  );
}
