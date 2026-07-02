"use client";

import type { Appointment } from "@repo/shared";
import { apiFetch } from "@/lib/api";

interface AppointmentRowProps {
  appointment: Appointment;
  onCancelled: () => void;
}

export function AppointmentRow({ appointment, onCancelled }: AppointmentRowProps) {
  const start = new Date(appointment.startTime);

  async function handleCancel() {
    await apiFetch(`/api/appointments/${appointment.id}`, {
      method: "DELETE",
    });
    onCancelled();
  }

  return (
    <tr className="border-b border-slate-100">
      <td className="px-4 py-3 text-sm">
        {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </td>
      <td
        className="px-4 py-3 text-sm"
        dangerouslySetInnerHTML={{ __html: appointment.bookerName }}
      />
      <td className="px-4 py-3 text-sm">{appointment.bookerEmail}</td>
      <td
        className="px-4 py-3 text-sm"
        dangerouslySetInnerHTML={{ __html: appointment.note || "—" }}
      />
      <td className="px-4 py-3 text-sm capitalize">{appointment.status}</td>
      <td className="px-4 py-3 text-sm">
        {appointment.status === "confirmed" && (
          <button
            onClick={handleCancel}
            className="rounded-md bg-red-50 px-2 py-1 text-red-700 hover:bg-red-100"
          >
            Cancel
          </button>
        )}
      </td>
    </tr>
  );
}
