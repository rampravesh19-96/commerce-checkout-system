"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export function StorefrontHeader() {
  const { isHydrated, totalItems } = useCart();
  const { isHydrated: isAuthHydrated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
            CC
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Storefront
            </p>
            <p className="text-base font-semibold text-slate-950 sm:text-lg">
              Commerce Checkout
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthHydrated && user ? (
            <>
              <Link
                href="/orders"
                className="hidden items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:inline-flex"
              >
                Orders
              </Link>
              <Link
                href="/ops/orders"
                className="hidden items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 lg:inline-flex"
              >
                Ops
              </Link>
              <span className="hidden text-sm text-slate-600 sm:inline">
                Hi, <span className="font-medium text-slate-900">{user.name}</span>
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:inline-flex"
              >
                Sign up
              </Link>
            </>
          )}

          <Link
            href="/cart"
            className="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            <span>Cart</span>
            <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
              {isHydrated ? totalItems : 0}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
