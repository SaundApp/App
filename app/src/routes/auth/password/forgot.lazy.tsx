import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@repo/form-types";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";

export const Route = createLazyFileRoute("/auth/password/forgot")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <div className="m-auto flex flex-col justify-center gap-3">
      <div>
        <h1>{t("auth.forgot_password")}</h1>
        <p className="muted">{t("auth.forgot_password_description")}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => {
              axiosClient
                .post("/auth/password/forgot", values)
                .then(() => {
                  toast({
                    description: t("toast.success.forgot_password"),
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
              const error = values.email || values.root;
              toast({
                variant: "destructive",
                description: t("toast.error." + error?.message || "base"),
              });
            },
          )}
          className="flex flex-col gap-3"
        >
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-secondary"
                    placeholder={t("input.email")}
                    type="email"
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
