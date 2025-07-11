import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must not exceed 60 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must not exceed 16 characters")
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, "Password must contain at least one uppercase letter and one special character"),
  address: z.string().max(400, "Address must not exceed 400 characters"),
});

export const userSchema = z.object({
  name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must not exceed 60 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must not exceed 16 characters")
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, "Password must contain at least one uppercase letter and one special character"),
  address: z.string().max(400, "Address must not exceed 400 characters"),
  role: z.enum(["admin", "user", "store"]),
});

export const storeSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100, "Store name must not exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().max(400, "Address must not exceed 400 characters"),
  ownerId: z.number().optional(),
});

export const ratingSchema = z.object({
  storeId: z.number(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must not exceed 5"),
});

export const passwordUpdateSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must not exceed 16 characters")
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, "Password must contain at least one uppercase letter and one special character"),
});
