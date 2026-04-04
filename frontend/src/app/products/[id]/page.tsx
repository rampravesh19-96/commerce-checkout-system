"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, Product, formatPrice, getProductById } from "@/lib/api";

function getStockLabel(stock: number) {
  if (stock <= 0) {
    return {
      text: "Out of stock",
      className: "bg-red-50 text-red-700 border border-red-200",
    };
  }

  if (stock <= 5) {
    return {
      text: `Low stock: ${stock} left`,
      className: "bg-amber-50 text-amber-800 border border-amber-200",
    };
  }

  return {
    text: "In stock",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const productId = useMemo(() => Number(params.id), [params.id]);

  useEffect(() => {
    if (!Number.isInteger(productId) || productId <= 0) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    async function loadProduct() {
      setIsLoading(true);
      setErrorMessage("");
      setIsNotFound(false);

      try {
        const productData = await getProductById(productId);
        setProduct(productData);
      } catch (error) {
        setProduct(null);

        if (error instanceof ApiError && error.status === 404) {
          setIsNotFound(true);
        } else {
          setErrorMessage("We couldn't load this product right now. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [productId, retryCount]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="mb-8 h-6 w-36 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="aspect-[4/3] animate-pulse rounded-[2rem] bg-slate-200" />
            <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-24 w-full animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Product Details
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Product not found
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            The product you are looking for may have been removed or the link may be
            incorrect.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Back to catalog
          </Link>
        </section>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Product Details
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Something went wrong
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{errorMessage}</p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setRetryCount((current) => current + 1)}
              className="rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              Back to catalog
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  const stockStatus = getStockLabel(product.stock);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          {"<"} Back to catalog
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="aspect-[4/3] bg-slate-100">
              <Image
                src={product.thumbnailUrl}
                alt={product.name}
                width={1200}
                height={900}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                {product.category.name}
              </span>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${stockStatus.className}`}>
                {stockStatus.text}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              {product.shortDescription || product.description}
            </p>

            <p className="mt-6 text-3xl font-semibold text-slate-950">
              {formatPrice(product.priceInPaise)}
            </p>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Product overview
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-700">{product.description}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
