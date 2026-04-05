"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  ApiError,
  createRazorpayOrder,
  formatPrice,
  verifyRazorpayPayment,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import {
  generateMockOrderId,
  saveOrderConfirmation,
  saveOrderToHistory,
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
type PaymentStage = "idle" | "creating-order" | "awaiting-payment" | "verifying";

const initialFormState: CheckoutForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

const RAZORPAY_CHECKOUT_SCRIPT_ID = "razorpay-checkout-script";
const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

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

function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  const existingScript = document.getElementById(RAZORPAY_CHECKOUT_SCRIPT_ID) as
    | HTMLScriptElement
    | null;

  if (existingScript) {
    return new Promise<boolean>((resolve) => {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.id = RAZORPAY_CHECKOUT_SCRIPT_ID;
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getPaymentCtaLabel(stage: PaymentStage) {
  switch (stage) {
    case "creating-order":
      return "Preparing payment...";
    case "awaiting-payment":
      return "Waiting for payment...";
    case "verifying":
      return "Verifying payment...";
    default:
      return "Pay with Razorpay";
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while starting payment. Please try again.";
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isHydrated: isAuthHydrated, user } = useAuth();
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
  const [form, setForm] = useState<CheckoutForm>({
    ...initialFormState,
    fullName: user?.name || "",
    email: user?.email || "",
  });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [hasEditedFullName, setHasEditedFullName] = useState(false);
  const [hasEditedEmail, setHasEditedEmail] = useState(false);
  const [paymentStage, setPaymentStage] = useState<PaymentStage>("idle");
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthHydrated) {
      return;
    }

    if (!user) {
      router.replace("/login?redirect=%2Fcheckout");
    }
  }, [isAuthHydrated, router, user]);

  const handleChange =
    (field: keyof CheckoutForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;

      if (field === "fullName") {
        setHasEditedFullName(true);
      }

      if (field === "email") {
        setHasEditedEmail(true);
      }

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formToSubmit: CheckoutForm = {
      ...form,
      fullName: hasEditedFullName ? form.fullName : user?.name ?? form.fullName,
      email: hasEditedEmail ? form.email : user?.email ?? form.email,
    };

    const validationErrors = validateForm(formToSubmit);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!grandTotalInPaise || grandTotalInPaise <= 0) {
      setPaymentFeedback("Your cart total is invalid. Please review the cart and try again.");
      return;
    }

    const checkoutScriptLoaded = await loadRazorpayCheckoutScript();

    if (!checkoutScriptLoaded || !window.Razorpay) {
      setPaymentFeedback("Unable to load Razorpay Checkout right now. Please refresh and try again.");
      return;
    }

    setErrors({});
    setPaymentFeedback(null);
    setPaymentStage("creating-order");

    const appOrderId = generateMockOrderId();
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!razorpayKeyId) {
      setPaymentStage("idle");
      setPaymentFeedback("Razorpay test key is missing on the frontend environment.");
      return;
    }

    try {
      const razorpayOrder = await createRazorpayOrder({
        amountInPaise: grandTotalInPaise,
        receipt: appOrderId,
      });

      await new Promise<void>((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: razorpayKeyId || razorpayOrder.keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Commerce Checkout System",
          description: "Test payment for demo checkout",
          order_id: razorpayOrder.id,
          prefill: {
            name: formToSubmit.fullName.trim(),
            email: formToSubmit.email.trim(),
            contact: formToSubmit.phone.trim(),
          },
          readonly: {
            email: Boolean(formToSubmit.email.trim()),
            name: Boolean(formToSubmit.fullName.trim()),
          },
          notes: {
            mode: "test",
            appOrderId,
          },
          theme: {
            color: "#0f172a",
          },
          modal: {
            ondismiss: () => {
              setPaymentStage("idle");
              setPaymentFeedback(
                "Payment was cancelled. Your cart is still intact and you can try again anytime.",
              );
              reject(new Error("Payment cancelled"));
            },
          },
          handler: async (response) => {
            try {
              setPaymentStage("verifying");

              const verification = await verifyRazorpayPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              const orderConfirmation = {
                orderId: appOrderId,
                createdAt: new Date().toISOString(),
                status: "Confirmed" as const,
                user: {
                  email: user?.email ?? formToSubmit.email,
                  name: user?.name ?? formToSubmit.fullName,
                },
                customer: {
                  fullName: formToSubmit.fullName.trim(),
                  email: formToSubmit.email.trim(),
                  phone: formToSubmit.phone.trim(),
                },
                shippingAddress: {
                  addressLine: formToSubmit.addressLine.trim(),
                  city: formToSubmit.city.trim(),
                  state: formToSubmit.state.trim(),
                  pincode: formToSubmit.pincode.trim(),
                },
                coupon: appliedCoupon,
                items: cartItems,
                pricing: {
                  itemTotalInPaise: totalPriceInPaise,
                  discountInPaise,
                  deliveryFeeInPaise,
                  grandTotalInPaise,
                },
                payment: {
                  provider: "Razorpay" as const,
                  mode: verification.mode,
                  razorpayOrderId: verification.orderId,
                  razorpayPaymentId: verification.paymentId,
                  verifiedAt: new Date().toISOString(),
                },
              };

              saveOrderConfirmation(orderConfirmation);
              saveOrderToHistory(orderConfirmation);
              clearCart();
              setPaymentFeedback(null);
              resolve();
              router.push("/order-confirmation");
            } catch (error) {
              setPaymentStage("idle");
              setPaymentFeedback(
                getErrorMessage(error) ||
                  "Payment completed but verification failed. Please contact support for the demo.",
              );
              reject(error instanceof Error ? error : new Error("Payment verification failed"));
            }
          },
        });

        razorpay.on("payment.failed", (response) => {
          setPaymentStage("idle");
          setPaymentFeedback(
            response.error.description ||
              "Payment failed in test mode. Your cart is intact and you can retry.",
          );
          reject(new Error(response.error.description || "Payment failed"));
        });

        setPaymentStage("awaiting-payment");
        razorpay.open();
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Payment cancelled") {
        return;
      }

      setPaymentStage("idle");
      setPaymentFeedback(getErrorMessage(error));
    }
  };

  if (!isHydrated || !isAuthHydrated) {
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

  if (!user) {
    return null;
  }

  const displayFullName = hasEditedFullName ? form.fullName : user.name;
  const displayEmail = hasEditedEmail ? form.email : user.email;
  const isProcessingPayment = paymentStage !== "idle";

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8">
          <p className="page-eyebrow">Checkout</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Your cart is empty
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Add products to your cart before continuing to checkout.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/" className="btn-primary">
              Browse catalog
            </Link>
            <Link href="/cart" className="btn-secondary">
              Go to cart
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
      <section className="page-shell">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Checkout
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Shipping details and secure test payment
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
                Fill in the delivery details, then continue to Razorpay Checkout in test mode.
                Your order is confirmed only after backend payment verification succeeds.
              </p>
            </div>

            {paymentFeedback ? (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {paymentFeedback}
              </div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={displayFullName}
                  onChange={handleChange("fullName")}
                  className="input-field"
                  placeholder="Aarav Sharma"
                  disabled={isProcessingPayment}
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
                  value={displayEmail}
                  onChange={handleChange("email")}
                  className="input-field"
                  placeholder="aarav@example.com"
                  disabled={isProcessingPayment}
                />
                {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email}</p> : null}
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
                  className="input-field"
                  placeholder="9876543210"
                  disabled={isProcessingPayment}
                />
                {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone}</p> : null}
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
                  className="textarea-field"
                  placeholder="Flat 12B, Park View Residency, MG Road"
                  disabled={isProcessingPayment}
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
                  className="input-field"
                  placeholder="Bengaluru"
                  disabled={isProcessingPayment}
                />
                {errors.city ? <p className="mt-2 text-sm text-red-600">{errors.city}</p> : null}
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
                  className="input-field"
                  placeholder="Karnataka"
                  disabled={isProcessingPayment}
                />
                {errors.state ? <p className="mt-2 text-sm text-red-600">{errors.state}</p> : null}
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
                  className="input-field"
                  placeholder="560001"
                  disabled={isProcessingPayment}
                />
                {errors.pincode ? (
                  <p className="mt-2 text-sm text-red-600">{errors.pincode}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="btn-primary" disabled={isProcessingPayment}>
                {getPaymentCtaLabel(paymentStage)}
              </button>
              <Link
                href="/cart"
                className={`btn-secondary ${isProcessingPayment ? "pointer-events-none opacity-60" : ""}`}
                aria-disabled={isProcessingPayment}
              >
                Back to cart
              </Link>
            </div>
          </form>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Payment mode
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Razorpay sandbox only
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                This milestone uses Razorpay test mode. The order is confirmed only after signature
                verification on the backend.
              </p>
            </div>

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
