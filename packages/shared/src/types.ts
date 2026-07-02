export type AppointmentStatus = "confirmed" | "cancelled";

export interface User {
  id: string;
  email: string;
  name: string;
  bookingSlug: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface AvailabilityRule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  bookerName: string;
  bookerEmail: string;
  note: string | null;
  status: AppointmentStatus;
  ownerId: string;
  createdAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface PublicProfile {
  name: string;
  bookingSlug: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  details?: string;
}
