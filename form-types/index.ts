import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "min_username")
      .max(20, "max_username")
      .regex(/^[a-zA-Z0-9_]+$/, "invalid_username"),
    name: z.string().min(3, "min_name"),
    email: z.string().email("invalid_email"),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/,
        "invalid_password",
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

export const forgotPasswordSchema = z.object({
  email: z.string().email("invalid_email"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("invalid_email"),
    token: z.string(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/,
        "invalid_password",
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

export const updateSchema = z.object({
  avatar: z.string().optional(),
  name: z.string().min(3, "min_name"),
  username: z
    .string()
    .min(3, "min_username")
    .max(20, "max_username")
    .regex(/^[a-zA-Z0-9_]+$/, "invalid_username"),
  bio: z.string().optional(),
  email: z.string().email("invalid_email"),
  private: z.boolean().default(false).optional(),
});

export const updateSubscriptionSchema = z.object({
  perks: z
    .array(z.string().min(1, "empty_perks"), {
      message: "empty_perks",
    })
    .nonempty("empty_perks"),
  price: z.coerce.number().min(0.5, "min_price"),
});

export const NotificationMethod = z.enum(["EMAIL", "PUSH", "APP"]);
export const notificationSettingsSchema = z.object({
  like: z
    .array(NotificationMethod)
    .refine((val) => val.length === 0 || val.includes("APP"), {
      message: "app_required",
    })
    .optional(),
  comment: z
    .array(NotificationMethod)
    .refine((val) => val.length === 0 || val.includes("APP"), {
      message: "app_required",
    })
    .optional(),
  follow: z
    .array(NotificationMethod)
    .refine((val) => val.length === 0 || val.includes("APP"), {
      message: "app_required",
    })
    .optional(),
  follow_request: z
    .array(NotificationMethod)
    .refine((val) => val.length === 0 || val.includes("APP"), {
      message: "app_required",
    })
    .optional(),
  mention: z
    .array(NotificationMethod)
    .refine((val) => val.length === 0 || val.includes("APP"), {
      message: "app_required",
    })
    .optional(),
  dm: z
    .array(NotificationMethod)
    .refine((val) => val.length === 0 || val.includes("APP"), {
      message: "app_required",
    })
    .optional(),
  leaderboard: z
    .array(NotificationMethod)
    .refine((val) => val.length === 0 || val.includes("APP"), {
      message: "app_required",
    })
    .optional(),
  post: z
    .array(NotificationMethod)
    .refine((val) => val.length === 0 || val.includes("APP"), {
      message: "app_required",
    })
    .optional(),
});

export const createChatSchema = z.object({
  name: z.string(),
  imageId: z.string().optional(),
  userIds: z.array(z.string()).nonempty(),
});
