"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const {
    cartItems,
    decreaseQuantity,
    increaseQuantity,
    isHydrated,
    removeItem,
    totalItems,
    totalPriceInPaise,
  } = useCart();

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="mb-8 h-10 w-48 animate-pulse rounded bg-slate-200" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[120px_1fr]"
              >
                <div className="aspect-square animate-pulse rounded-2xl bg-slate-200" />
                <div className="space-y-3">
                  <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-10 w-40 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Shopping Cart
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Your cart is empty
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Add a few products from the catalog to start building your checkout flow.
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
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Shopping Cart
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Review your selected items
            </h1>
          </div>
          <p className="text-sm text-slate-600">
            {totalItems} item{totalItems === 1 ? "" : "s"} in cart
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-4">
            {cartItems.map((item) => {
              const subtotal = item.unitPriceInPaise * item.quantity;

              return (
                <article
                  key={item.productId}
                  className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[120px_1fr]"
                >
                  <div className="overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={240}
                      height={240}
                      className="aspect-square h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-slate-900">{item.name}</h2>
                      <p className="text-sm text-slate-600">
                        Unit price: {formatPrice(item.unitPriceInPaise)}
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        Subtotal: {formatPrice(subtotal)}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <div className="flex items-center rounded-full border border-slate-300 bg-white">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.productId)}
                          className="px-4 py-2 text-lg font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          -
                        </button>
                        <span className="min-w-12 px-3 text-center text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.productId)}
                          className="px-4 py-2 text-lg font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-sm font-medium text-red-600 transition hover:text-red-700"
                      >
                        Remove item
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Cart summary</h2>
            <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
              <span>Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-lg font-semibold text-slate-950">
              <span>Total</span>
              <span>{formatPrice(totalPriceInPaise)}</span>
            </div>
            <Link
              href="/"
              className="mt-6 inline-flex w-full justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
