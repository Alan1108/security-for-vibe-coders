import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  bookingSlug: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9-]+$/),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDurationMinutes: z.number().int().positive(),
});

export const updateAvailabilitySchema = z.object({
  rules: z.array(availabilityRuleSchema),
  bookingSlug: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

export const bookAppointmentSchema = z.object({
  startTime: z.string().datetime(),
  bookerName: z.string().min(1),
  bookerEmail: z.string().email(),
  note: z.string().optional(),
  ownerId: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
