"use client";

import Link from "next/link";
import { Suspense, type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectPath = searchParams.get("redirect") || "/";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
      });
      router.push(redirectPath);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to log in right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
      <section className="mx-auto max-w-lg px-6 py-12 sm:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="page-eyebrow">Login</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in to continue shopping, manage orders, and complete checkout faster.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
      <section className="mx-auto max-w-lg px-6 py-12 sm:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-10 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-8 space-y-5">
            <div className="h-14 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-14 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-12 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}