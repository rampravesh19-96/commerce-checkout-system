"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";
import {
  generateMockOrderId,
  saveOrderConfirmation,
} from "@/lib/order-confirmation";

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
};

type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

const initialFormState: CheckoutForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

function validateForm(form: CheckoutForm) {
  const errors: CheckoutErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10}$/.test(form.phone)) {
    errors.phone = "Enter a valid 10-digit phone number.";
  }

  if (!form.addressLine.trim()) {
    errors.addressLine = "Address line is required.";
  }

  if (!form.city.trim()) {
    errors.city = "City is required.";
  }

  if (!form.state.trim()) {
    errors.state = "State is required.";
  }

  if (!form.pincode.trim()) {
    errors.pincode = "Pincode is required.";
  } else if (!/^\d{6}$/.test(form.pincode)) {
    errors.pincode = "Enter a valid 6-digit pincode.";
  }

  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    appliedCoupon,
    cartItems,
    clearCart,
    deliveryFeeInPaise,
    discountInPaise,
    grandTotalInPaise,
    isHydrated,
    totalItems,
    totalPriceInPaise,
  } = useCart();
  const [form, setForm] = useState<CheckoutForm>(initialFormState);
  const [errors, setErrors] = useState<CheckoutErrors>({});

  const handleChange =
    (field: keyof CheckoutForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const orderConfirmation = {
      orderId: generateMockOrderId(),
      createdAt: new Date().toISOString(),
      customer: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      shippingAddress: {
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      },
      coupon: appliedCoupon,
      items: cartItems,
      pricing: {
        itemTotalInPaise: totalPriceInPaise,
        discountInPaise,
        deliveryFeeInPaise,
        grandTotalInPaise,
      },
    };

    saveOrderConfirmation(orderConfirmation);
    clearCart();
    setErrors({});
    router.push("/order-confirmation");
  };

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="mb-8 h-10 w-56 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200" />
                </div>
              ))}
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
            </div>
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
            Checkout
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Your cart is empty
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Add products to your cart before continuing to checkout.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Browse catalog
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              Go to cart
            </Link>
          </div>
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
              Checkout
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Shipping details and order summary
            </h1>
          </div>
          <p className="text-sm text-slate-600">
            {totalItems} item{totalItems === 1 ? "" : "s"} ready to order
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900">Shipping address</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fill in the delivery details for this mock checkout flow.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  placeholder="Aarav Sharma"
                />
                {errors.fullName ? (
                  <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  placeholder="aarav@example.com"
                />
                {errors.email ? (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  placeholder="9876543210"
                />
                {errors.phone ? (
                  <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="addressLine"
                >
                  Address line
                </label>
                <textarea
                  id="addressLine"
                  value={form.addressLine}
                  onChange={handleChange("addressLine")}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  placeholder="Flat 12B, Park View Residency, MG Road"
                />
                {errors.addressLine ? (
                  <p className="mt-2 text-sm text-red-600">{errors.addressLine}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange("city")}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  placeholder="Bengaluru"
                />
                {errors.city ? (
                  <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="state">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  value={form.state}
                  onChange={handleChange("state")}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  placeholder="Karnataka"
                />
                {errors.state ? (
                  <p className="mt-2 text-sm text-red-600">{errors.state}</p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="pincode">
                  Pincode
                </label>
                <input
                  id="pincode"
                  type="text"
                  value={form.pincode}
                  onChange={handleChange("pincode")}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  placeholder="560001"
                />
                {errors.pincode ? (
                  <p className="mt-2 text-sm text-red-600">{errors.pincode}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Place Order
              </button>
              <Link
                href="/cart"
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                Back to cart
              </Link>
            </div>
          </form>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>

            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-600">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {formatPrice(item.unitPriceInPaise * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Item total</span>
                <span>{formatPrice(totalPriceInPaise)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Discount</span>
                <span className="font-medium text-emerald-700">- {formatPrice(discountInPaise)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Delivery fee</span>
                <span>{formatPrice(deliveryFeeInPaise)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-slate-950">
                <span>Grand total</span>
                <span>{formatPrice(grandTotalInPaise)}</span>
              </div>
            </div>

            {appliedCoupon ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800">
                  Applied coupon: {appliedCoupon.code}
                </p>
                <p className="mt-1 text-xs text-emerald-700">{appliedCoupon.label}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
