import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Share your calendar. Get booked.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          BookMe lets you set weekly availability and share a public link so
          anyone can grab a slot on your calendar. Perfect for consultations,
          office hours, and intro calls.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Create your booking page
          </Link>
          <Link
            href="/book/demo"
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Try the demo booking page
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Set availability",
            body: "Define recurring weekly hours and slot duration.",
          },
          {
            title: "Share your link",
            body: "Send your public /book/your-slug page to invitees.",
          },
          {
            title: "Manage bookings",
            body: "View upcoming appointments and cancel when needed.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <h2 className="font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
