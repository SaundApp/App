import Divider from "@/components/Divider";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { loginSchema } from "form-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export const Route = createLazyFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { token } = Route.useSearch<{
    token: string | undefined;
  }>();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (token) {
      const tokens = JSON.parse(localStorage.getItem("tokens") || "[]");
      tokens.push(token);

      localStorage.setItem("token", token);
      localStorage.setItem("tokens", JSON.stringify(tokens));

      location.href = "/";
    }
  }, [token]);

  return (
    <div className="flex flex-col gap-3 justify-center m-auto w-full">
      <div>
        <h1>Login</h1>
        <p className="muted">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
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
                      localStorage.getItem("tokens") || "[]"
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
                    description: t("auth.login_error"),
                  })
                );
            },
            (values) => {
              const error = values.password || values.username || values.root;
              toast({
                variant: "destructive",
                description: t("auth." + error?.message || "login_error"),
              });
            }
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
                    placeholder="Username"
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
                    placeholder="Password"
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
            {/*TODO: Add forgot password route*/}
            <Link className="flex items-center gap-1">
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
    </div>
  );
}
