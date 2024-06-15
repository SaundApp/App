import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "min_username")
      .max(20, "max_username")
      .regex(/^[a-zA-Z0-9_]+$/, "invalid_username"),
    name: z.string(),
    email: z.string().email(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/,
        "invalid_password"
      ),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});