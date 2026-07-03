"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Appointment } from "@repo/shared";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import { AppointmentRow } from "@/components/AppointmentRow";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async (query?: string) => {
    setFetching(true);
    setError("");
    try {
      const path = query
        ? `/api/appointments?q=${encodeURIComponent(query)}`
        : "/api/appointments";
      const data = await apiFetch<Appointment[]>(path);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      loadAppointments();
    }
  }, [user, loading, router, loadAppointments]);

  if (loading || !user) {
    return <p className="text-slate-600">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your appointments</h1>
        <p className="text-sm text-slate-600">
          Public booking link:{" "}
          <a href={`/book/${user.bookingSlug}`} className="text-brand-600 hover:underline">
            /book/{user.bookingSlug}
          </a>
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadAppointments(search);
        }}
        className="flex gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or note..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
        >
          Search
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm text-slate-500">
                  Loading appointments...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm text-slate-500">
                  No appointments yet. Share your booking link to get started.
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  onCancelled={() => loadAppointments(search || undefined)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
