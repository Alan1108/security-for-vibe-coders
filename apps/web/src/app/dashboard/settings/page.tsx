"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AvailabilityRule } from "@repo/shared";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultRules: Omit<AvailabilityRule, "id">[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
];

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rules, setRules] = useState<Omit<AvailabilityRule, "id">[]>(defaultRules);
  const [bookingSlug, setBookingSlug] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setBookingSlug(user.bookingSlug);
      apiFetch<AvailabilityRule[]>("/api/availability")
        .then((data) => {
          if (data.length > 0) {
            setRules(
              data.map(({ dayOfWeek, startTime, endTime, slotDurationMinutes }) => ({
                dayOfWeek,
                startTime,
                endTime,
                slotDurationMinutes,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [user, loading, router]);

  function toggleDay(dayOfWeek: number) {
    setRules((current) => {
      const exists = current.some((rule) => rule.dayOfWeek === dayOfWeek);
      if (exists) {
        return current.filter((rule) => rule.dayOfWeek !== dayOfWeek);
      }
      return [
        ...current,
        {
          dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
          slotDurationMinutes: 30,
        },
      ];
    });
  }

  function updateRule(
    dayOfWeek: number,
    field: "startTime" | "endTime" | "slotDurationMinutes",
    value: string
  ) {
    setRules((current) =>
      current.map((rule) =>
        rule.dayOfWeek === dayOfWeek
          ? {
              ...rule,
              [field]:
                field === "slotDurationMinutes" ? Number(value) : value,
            }
          : rule
      )
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiFetch("/api/availability", {
        method: "PUT",
        body: JSON.stringify({ rules, bookingSlug }),
      });
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <p className="text-slate-600">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Availability settings</h1>
        <p className="text-sm text-slate-600">
          Configure your weekly hours and public booking slug.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <label className="block text-sm">
          <span className="text-slate-700">Booking slug</span>
          <input
            value={bookingSlug}
            onChange={(e) => setBookingSlug(e.target.value.toLowerCase())}
            className="mt-1 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>

        <div className="space-y-3">
          <h2 className="font-medium text-slate-900">Weekly schedule</h2>
          {DAY_LABELS.map((label, dayOfWeek) => {
            const rule = rules.find((item) => item.dayOfWeek === dayOfWeek);
            const enabled = Boolean(rule);

            return (
              <div
                key={label}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3"
              >
                <label className="flex w-24 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleDay(dayOfWeek)}
                  />
                  {label}
                </label>
                {enabled && rule && (
                  <>
                    <input
                      type="time"
                      value={rule.startTime}
                      onChange={(e) =>
                        updateRule(dayOfWeek, "startTime", e.target.value)
                      }
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-slate-500">to</span>
                    <input
                      type="time"
                      value={rule.endTime}
                      onChange={(e) =>
                        updateRule(dayOfWeek, "endTime", e.target.value)
                      }
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                    <select
                      value={rule.slotDurationMinutes}
                      onChange={(e) =>
                        updateRule(dayOfWeek, "slotDurationMinutes", e.target.value)
                      }
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>
    </div>
  );
}
