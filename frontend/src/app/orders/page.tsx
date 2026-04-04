"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getOrderHistory } from "@/lib/order-confirmation";

function formatPlacedDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function OrdersPage() {
  const router = useRouter();
  const { isHydrated, user } = useAuth();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      router.replace("/login?redirect=%2Forders");
    }
  }, [isHydrated, router, user]);

  const orders = useMemo(() => {
    if (!isHydrated || !user) {
      return [];
    }

    return getOrderHistory().filter((order) => order.user.email === user.email);
  }, [isHydrated, user]);

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="mb-8 h-10 w-56 animate-pulse rounded bg-slate-200" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            My Orders
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            No orders yet
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Your recent mock orders will appear here after you complete checkout.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            My Orders
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Recent orders for {user.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Review the latest mock orders from your storefront account.
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <article
                key={order.orderId}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {order.orderId}
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-950">
                      {itemCount} item{itemCount === 1 ? "" : "s"} ordered
                    </h2>
                    <p className="text-sm text-slate-600">
                      Placed on {formatPlacedDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 md:min-w-[360px]">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Status
                      </p>
                      <p className="mt-2 text-sm font-medium text-emerald-700">{order.status}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Grand total
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {formatPrice(order.pricing.grandTotalInPaise)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Customer
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{order.customer.fullName}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
