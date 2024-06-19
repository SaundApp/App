import Divider from "@/components/Divider";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { registerSchema } from "form-types";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

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
    <div className="flex flex-col gap-3 justify-center m-auto">
      <div>
        <h1>{t("auth.register")}</h1>
        <p className="muted">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => {
              axiosClient
                .post("/auth/register", values)
                .then((res) => {
                  if (res.data && res.data.token) {
                    localStorage.setItem("token", res.data.token);
                    location.href = "/";
                  }
                })
                .catch(() =>
                  toast({
                    variant: "destructive",
                    description: t("auth.register_error"),
                  })
                );
            },
            (values) => {
              const error =
                values.confirmPassword ||
                values.password ||
                values.username ||
                values.email ||
                values.name ||
                values.root;
              toast({
                variant: "destructive",
                description: t("auth." + error?.message || "register_error"),
              });
            }
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
                      placeholder="Username"
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
                      placeholder="Name"
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
                    placeholder="Email"
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
                    placeholder="Password"
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
                    placeholder="Confirm Password"
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
