"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  getOrderHistory,
  ORDER_STATUSES,
  OrderConfirmationData,
  OrderStatus,
  updateOrderStatus,
} from "@/lib/order-confirmation";

function formatPlacedDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function OpsOrdersPage() {
  const router = useRouter();
  const { isHydrated, user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<"All" | OrderStatus>("All");

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      router.replace("/login?redirect=%2Fops%2Forders");
    }
  }, [isHydrated, router, user]);

  const filteredOrders: OrderConfirmationData[] = (() => {
    if (!isHydrated || !user) {
      return [];
    }

    void refreshKey;
    const allOrders = getOrderHistory();

    if (selectedStatus === "All") {
      return allOrders;
    }

    return allOrders.filter((order) => order.status === selectedStatus);
  })();

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="mb-8 h-10 w-64 animate-pulse rounded bg-slate-200" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Ops Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Order operations
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Review recent mock orders and update their fulfillment status.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <label htmlFor="status-filter" className="mb-2 block text-sm font-medium text-slate-700">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as "All" | OrderStatus)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            >
              <option value="All">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">No orders for this filter</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Try switching the status filter or place a few mock orders first.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <article
                  key={order.orderId}
                  className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="grid gap-4 sm:grid-cols-2 xl:flex-1 xl:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Order ID
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-950">{order.orderId}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Customer
                        </p>
                        <p className="mt-2 text-base font-medium text-slate-950">
                          {order.customer.fullName}
                        </p>
                        <p className="text-sm text-slate-600">{order.customer.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Placed date
                        </p>
                        <p className="mt-2 text-base font-medium text-slate-950">
                          {formatPlacedDate(order.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Item count
                        </p>
                        <p className="mt-2 text-base font-medium text-slate-950">{itemCount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Grand total
                        </p>
                        <p className="mt-2 text-base font-medium text-slate-950">
                          {formatPrice(order.pricing.grandTotalInPaise)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Current status
                        </p>
                        <p className="mt-2 text-base font-medium text-emerald-700">{order.status}</p>
                      </div>
                    </div>

                    <div className="xl:min-w-[260px]">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Update status
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ORDER_STATUSES.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              updateOrderStatus(order.orderId, status);
                              setRefreshKey((current) => current + 1);
                            }}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              order.status === status
                                ? "bg-slate-900 text-white"
                                : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
