"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryFilter } from "@/components/category-filter";
import { ProductCard } from "@/components/product-card";
import {
  Category,
  Product,
  ProductSortOption,
  getCategories,
  getProducts,
} from "@/lib/api";

const SORT_OPTIONS: Array<{ label: string; value: ProductSortOption }> = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSort, setSelectedSort] = useState<ProductSortOption>("newest");
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
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    async function loadProducts() {
      if (!hasLoadedProducts.current) {
        setIsLoading(true);
      } else {
        setIsProductsLoading(true);
      }

      try {
        const productResponse = await getProducts({
          categorySlug: selectedCategory,
          search: debouncedSearch,
          sort: selectedSort,
        });
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
  }, [selectedCategory, debouncedSearch, selectedSort, retryCount]);

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
                Search, filter, and sort products with a simple catalog experience.
              </p>
            </div>
            {isProductsLoading ? (
              <p className="text-sm font-medium text-amber-700">Updating products...</p>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div>
                <label htmlFor="catalog-search" className="mb-2 block text-sm font-medium text-slate-700">
                  Search products
                </label>
                <input
                  id="catalog-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, brand, or keyword"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                />
              </div>

              <div>
                <label htmlFor="catalog-sort" className="mb-2 block text-sm font-medium text-slate-700">
                  Sort by
                </label>
                <select
                  id="catalog-sort"
                  value={selectedSort}
                  onChange={(event) => setSelectedSort(event.target.value as ProductSortOption)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              disabled={isLoading || isProductsLoading}
            />
          </div>
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
              No products matched your current search and filters. Try a different
              keyword or switch back to all products.
            </p>
          </div>
        ) : null}

        {!errorMessage && !isLoading && products.length > 0 ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{products.length}</span>{" "}
                products
              </p>
              {(debouncedSearch || selectedCategory || selectedSort !== "newest") && (
                <p className="text-sm text-slate-500">
                  {debouncedSearch ? `Search: "${debouncedSearch}"` : "Browsing catalog"}
                </p>
              )}
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
