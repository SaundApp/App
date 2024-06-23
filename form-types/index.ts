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
        message: "match_passwords",
        path: ["confirmPassword"],
      });
    }
  });

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const updateSchema = z.object({
  avatar: z.string().optional(),
  name: z.string().optional(),
  username: z.string().min(3, "username_length").optional(),
  bio: z.string().optional(),
  email: z.string().email("invalid_email").optional(),
  private: z.boolean().default(false).optional(),
});

export const updateSubscriptionSchema = z.object({
  perks: z.array(z.string().min(1, "empty_perks")).nonempty("empty_perks"),
  price: z.coerce.number().min(0.5),
});
