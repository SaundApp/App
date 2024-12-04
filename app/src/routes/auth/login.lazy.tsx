import Divider from "@/components/Divider";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@repo/form-types";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";

export const Route = createLazyFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if ("token" in search) {
      const tokens = JSON.parse(localStorage.getItem("tokens") || "[]");
      tokens.push(search.token);

      localStorage.setItem("token", search.token as string);
      localStorage.setItem("tokens", JSON.stringify(tokens));

      navigate({
        to: "/",
      }).then(() => window.location.reload());
    }
  }, [search, navigate]);

  return (
    <div className="m-auto flex w-full flex-col justify-center gap-3">
      <div>
        <h1>Login</h1>
        <p className="muted">{t("auth.login_description")}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => {
              axiosClient
                .post("/auth/login", values)
                .then((res) => {
                  if (res.data && res.data.token) {
                    const tokens = JSON.parse(
                      localStorage.getItem("tokens") || "[]",
                    );

                    if (!tokens.includes(res.data.token)) {
                      tokens.push(res.data.token);
                      localStorage.setItem("tokens", JSON.stringify(tokens));
                    }

                    localStorage.setItem("token", res.data.token);

                    navigate({
                      to: "/",
                    }).then(() => window.location.reload());
                  }
                })
                .catch(() =>
                  toast({
                    variant: "destructive",
                    description: t("toast.error.login"),
                  }),
                );
            },
            (values) => {
              const error = values.password || values.username || values.root;
              toast({
                variant: "destructive",
                description: t("toast.error." + error?.message || "base"),
              });
            },
          )}
          className="flex flex-col gap-3"
        >
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
                    autoCapitalize="off"
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

          <div className="flex items-center justify-between">
            <Link to="/auth/register" className="flex items-center gap-1">
              <p className="muted">{t("auth.register")}</p>
            </Link>
            <Link
              to="/auth/password/forgot"
              className="flex items-center gap-1"
            >
              <p className="muted">{t("auth.forgot_password")}</p>
            </Link>
          </div>

          <Button type="submit">Login</Button>
        </form>
      </Form>

      <Divider />

      <Button variant="secondary" asChild>
        <Link to={`${import.meta.env.VITE_API_URL}/auth/login/spotify`}>
          Spotify
        </Link>
      </Button>

      <div className="muted flex gap-1">
        <a href="https://saund.app/tos" className="underline" target="_blank">
          Terms of Service
        </a>
        <span>&</span>
        <a
          href="https://saund.app/privacy-policy"
          className="underline"
          target="_blank"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
