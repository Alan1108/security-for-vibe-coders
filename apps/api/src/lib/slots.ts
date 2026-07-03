import type { AvailabilityRule } from "@prisma/client";
import type { TimeSlot } from "@repo/shared";

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function minutesToDate(baseDate: Date, minutes: number): Date {
  const result = new Date(baseDate);
  result.setHours(0, 0, 0, 0);
  result.setMinutes(minutes);
  return result;
}

export function generateSlotsForDay(
  date: Date,
  rules: AvailabilityRule[],
  bookedStarts: Set<string>,
  slotDurationMinutes: number
): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const dayRules = rules.filter((rule) => rule.dayOfWeek === dayOfWeek);
  const slots: TimeSlot[] = [];
  const now = new Date();

  for (const rule of dayRules) {
    const startMinutes = parseTimeToMinutes(rule.startTime);
    const endMinutes = parseTimeToMinutes(rule.endTime);
    const duration = rule.slotDurationMinutes || slotDurationMinutes;

    for (let cursor = startMinutes; cursor + duration <= endMinutes; cursor += duration) {
      const startTime = minutesToDate(date, cursor);
      const endTime = minutesToDate(date, cursor + duration);

      if (startTime <= now) continue;

      const key = startTime.toISOString();
      if (bookedStarts.has(key)) continue;

      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    }
  }

  return slots;
}

export function generateAvailableSlots(
  rules: AvailabilityRule[],
  appointments: { startTime: Date; status: string }[],
  daysAhead = 14
): TimeSlot[] {
  const slotDuration =
    rules[0]?.slotDurationMinutes ?? 30;

  const bookedStarts = new Set(
    appointments
      .filter((a) => a.status === "confirmed")
      .map((a) => a.startTime.toISOString())
  );

  const slots: TimeSlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    slots.push(
      ...generateSlotsForDay(date, rules, bookedStarts, slotDuration)
    );
  }

  return slots;
}
