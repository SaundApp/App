import Divider from "@/components/Divider";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@repo/form-types";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";

export const Route = createLazyFileRoute("/auth/register")({
  component: Register,
});

function Register() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="m-auto flex flex-col justify-center gap-3">
      <div>
        <h1>{t("auth.register")}</h1>
        <p className="muted">{t("auth.register_description")}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => {
              axiosClient
                .post("/auth/register", values)
                .then((res) => {
                  if (res.data && res.data.token) {
                    const tokens = JSON.parse(
                      localStorage.getItem("tokens") || "[]",
                    );

                    tokens.push(res.data.token);

                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("tokens", JSON.stringify(tokens));

                    location.href = "/";
                  }
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
                values.username ||
                values.name ||
                values.email ||
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
          <div className="flex gap-3">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-secondary"
                      placeholder={t("input.username")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-secondary"
                      placeholder={t("input.name")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

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

          <Button type="submit">{t("auth.register")}</Button>
        </form>
      </Form>

      <Divider />

      <Button variant="secondary" asChild>
        <Link to={`${import.meta.env.VITE_API_URL}/auth/login/spotify`}>
          Spotify
        </Link>
      </Button>
    </div>
  );
}
