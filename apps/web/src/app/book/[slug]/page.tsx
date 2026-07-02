"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PublicProfile, TimeSlot } from "@repo/shared";
import { apiFetch } from "@/lib/api";

export default function BookPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookerName, setBookerName] = useState("");
  const [bookerEmail, setBookerEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profileData, slotData] = await Promise.all([
          apiFetch<PublicProfile>(`/api/public/${slug}`),
          apiFetch<TimeSlot[]>(`/api/public/${slug}/slots`),
        ]);
        setProfile(profileData);
        setSlots(slotData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking page");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedSlot) return;

    const start = new Date(selectedSlot.startTime);
    if (start <= new Date()) {
      setError("Please select a future time slot.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await apiFetch(`/api/public/${slug}/book`, {
        method: "POST",
        body: JSON.stringify({
          startTime: selectedSlot.startTime,
          bookerName,
          bookerEmail,
          note,
        }),
      });
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-slate-600">Loading availability...</p>;
  }

  if (error && !profile) {
    return <p className="text-red-600">{error}</p>;
  }

  if (confirmed && selectedSlot) {
    return (
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-green-700">You&apos;re booked!</h1>
        <p className="mt-2 text-slate-600">
          Your appointment with {profile?.name} is confirmed for{" "}
          {new Date(selectedSlot.startTime).toLocaleString()}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Book with {profile?.name}</h1>
        <p className="text-sm text-slate-600">Pick an available slot below.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-medium">Available slots</h2>
          <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
            {slots.length === 0 ? (
              <p className="text-sm text-slate-500">No open slots in the next two weeks.</p>
            ) : (
              slots.map((slot) => {
                const start = new Date(slot.startTime);
                const selected = selectedSlot?.startTime === slot.startTime;
                return (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                      selected
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 hover:border-brand-300"
                    }`}
                  >
                    {start.toLocaleDateString()} at{" "}
                    {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-medium">Your details</h2>
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <label className="block text-sm">
              <span>Name</span>
              <input
                value={bookerName}
                onChange={(e) => setBookerName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span>Email</span>
              <input
                type="email"
                value={bookerEmail}
                onChange={(e) => setBookerEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span>Note (optional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                rows={3}
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={!selectedSlot || submitting}
              className="w-full rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? "Booking..." : "Confirm booking"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
