"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-brand-700">
          BookMe
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/book/demo" className="text-slate-600 hover:text-brand-600">
            Demo booking
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-brand-600"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-slate-600 hover:text-brand-600"
              >
                Settings
              </Link>
              <button
                onClick={logout}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-brand-600">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
