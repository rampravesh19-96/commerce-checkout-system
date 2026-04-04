"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { formatPrice } from "@/lib/api";
import {
  clearOrderConfirmation,
  OrderConfirmationData,
} from "@/lib/order-confirmation";

const ORDER_CONFIRMATION_STORAGE_KEY = "commerce-checkout-order-confirmation";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(ORDER_CONFIRMATION_STORAGE_KEY);
}

export default function OrderConfirmationPage() {
  const rawConfirmation = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const confirmation = useMemo<OrderConfirmationData | null>(() => {
    if (!rawConfirmation) {
      return null;
    }

    try {
      return JSON.parse(rawConfirmation) as OrderConfirmationData;
    } catch {
      return null;
    }
  }, [rawConfirmation]);

  const handleContinueShopping = () => {
    clearOrderConfirmation();
  };

  if (!rawConfirmation) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8">
          <p className="page-eyebrow">Order Confirmation</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            No recent order found
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Complete checkout to see your order confirmation details here.
          </p>
          <Link
            href="/"
            className="btn-primary mt-8"
          >
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  if (!confirmation) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8">
          <p className="page-eyebrow">Order Confirmation</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Invalid confirmation data
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            We could not read the mock confirmation details from session storage.
          </p>
          <Link
            href="/"
            className="btn-primary mt-8"
          >
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
      <section className="page-shell">
        <div className="mb-10">
          <p className="page-eyebrow">Order Confirmation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Your mock order has been placed successfully
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Order ID: <span className="font-semibold text-slate-900">{confirmation.orderId}</span>
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <section className="surface-card p-8">
              <h2 className="text-xl font-semibold text-slate-900">Customer summary</h2>
              <div className="mt-5 space-y-2 text-sm leading-6 text-slate-700">
                <p>{confirmation.customer.fullName}</p>
                <p>{confirmation.customer.email}</p>
                <p>{confirmation.customer.phone}</p>
              </div>
            </section>

            <section className="surface-card p-8">
              <h2 className="text-xl font-semibold text-slate-900">Shipping address</h2>
              <div className="mt-5 space-y-2 text-sm leading-6 text-slate-700">
                <p>{confirmation.shippingAddress.addressLine}</p>
                <p>
                  {confirmation.shippingAddress.city}, {confirmation.shippingAddress.state}
                </p>
                <p>{confirmation.shippingAddress.pincode}</p>
              </div>
            </section>

            <section className="surface-card p-8">
              <h2 className="text-xl font-semibold text-slate-900">Ordered items</h2>
              {confirmation.coupon ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-medium text-emerald-800">
                    Coupon applied: {confirmation.coupon.code}
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">{confirmation.coupon.label}</p>
                </div>
              ) : null}
              <div className="mt-6 space-y-4">
                {confirmation.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Qty {item.quantity} x {formatPrice(item.unitPriceInPaise)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {formatPrice(item.unitPriceInPaise * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="surface-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Pricing summary</h2>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Item total</span>
                <span>{formatPrice(confirmation.pricing.itemTotalInPaise)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Discount</span>
                <span className="font-medium text-emerald-700">
                  - {formatPrice(confirmation.pricing.discountInPaise)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Delivery fee</span>
                <span>{formatPrice(confirmation.pricing.deliveryFeeInPaise)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-slate-950">
                <span>Grand total</span>
                <span>{formatPrice(confirmation.pricing.grandTotalInPaise)}</span>
              </div>
            </div>

            <Link
              href="/"
              onClick={handleContinueShopping}
              className="btn-primary mt-6 flex w-full"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
