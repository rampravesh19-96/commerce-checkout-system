"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryFilter } from "@/components/category-filter";
import { ProductCard } from "@/components/product-card";
import { Category, Product, getCategories, getProducts } from "@/lib/api";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [productsError, setProductsError] = useState("");
  const hasLoadedProducts = useRef(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoryData = await getCategories();
        setCategories(categoryData);
        setCategoriesError("");
      } catch {
        setCategoriesError("We couldn't load the categories right now. Please try again.");
      }
    }

    void loadCategories();
  }, [retryCount]);

  useEffect(() => {
    async function loadProducts() {
      if (!hasLoadedProducts.current) {
        setIsLoading(true);
      } else {
        setIsProductsLoading(true);
      }

      try {
        const productResponse = await getProducts(selectedCategory);
        setProducts(productResponse.data);
        setProductsError("");
        hasLoadedProducts.current = true;
      } catch {
        setProductsError("We couldn't load the products right now. Please try again.");
      } finally {
        setIsLoading(false);
        setIsProductsLoading(false);
      }
    }

    void loadProducts();
  }, [selectedCategory, retryCount]);

  const errorMessage = categoriesError || productsError;

  const retryLoad = () => {
    setCategoriesError("");
    setProductsError("");
    setRetryCount((current) => current + 1);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Product Catalog
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Discover a clean storefront built for realistic ecommerce flows.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Browse curated desk setup essentials across audio, keyboards, displays, and
            accessories.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Shop by category</h2>
              <p className="mt-1 text-sm text-slate-600">
                Filter products with a simple, fast catalog experience.
              </p>
            </div>
            {isProductsLoading ? (
              <p className="text-sm font-medium text-amber-700">Updating products...</p>
            ) : null}
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            disabled={isLoading || isProductsLoading}
          />
        </div>

        {errorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-red-900">Something went wrong</h2>
            <p className="mt-3 text-sm leading-6 text-red-700">{errorMessage}</p>
            <button
              type="button"
              onClick={retryLoad}
              className="mt-5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!errorMessage && isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-slate-200" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!errorMessage && !isLoading && products.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">No products found</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              There are no products in this category yet. Try switching back to all
              products.
            </p>
          </div>
        ) : null}

        {!errorMessage && !isLoading && products.length > 0 ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{products.length}</span>{" "}
                products
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
