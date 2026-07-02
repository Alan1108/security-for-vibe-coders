import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.session as string | undefined;
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : cookieToken;

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  bookingSlug: string;
  isAdmin: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    bookingSlug: user.bookingSlug,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toAppointment(appointment: {
  id: string;
  startTime: Date;
  endTime: Date;
  bookerName: string;
  bookerEmail: string;
  note: string | null;
  status: string;
  ownerId: string;
  createdAt: Date;
}) {
  return {
    id: appointment.id,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
    bookerName: appointment.bookerName,
    bookerEmail: appointment.bookerEmail,
    note: appointment.note,
    status: appointment.status as "confirmed" | "cancelled",
    ownerId: appointment.ownerId,
    createdAt: appointment.createdAt.toISOString(),
  };
}
