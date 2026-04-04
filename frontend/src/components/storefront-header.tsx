"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export function StorefrontHeader() {
  const { isHydrated, totalItems } = useCart();
  const { isHydrated: isAuthHydrated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

          <nav className="flex flex-wrap items-center gap-2 sm:justify-end">
            {isAuthHydrated && user ? (
              <>
                <span className="order-last w-full text-sm text-slate-600 sm:order-none sm:w-auto">
                  Signed in as <span className="font-medium text-slate-900">{user.name}</span>
                </span>
                <Link href="/orders" className="btn-secondary px-4 py-2">
                  Orders
                </Link>
                <Link href="/ops/orders" className="btn-secondary px-4 py-2">
                  Ops
                </Link>
                <button type="button" onClick={logout} className="btn-secondary px-4 py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary px-4 py-2">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary px-4 py-2">
                  Sign up
                </Link>
              </>
            )}

            <Link href="/cart" className="btn-secondary gap-3 px-4 py-2">
              <span>Cart</span>
              <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                {isHydrated ? totalItems : 0}
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
