export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  priceInPaise: number;
  compareAtPaise: number | null;
  sku: string;
  brand: string | null;
  thumbnailUrl: string;
  imagesJson: string | null;
  isActive: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
  };
};

export type ProductsResponse = {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProductSortOption = "newest" | "price_asc" | "price_desc" | "name_asc";

type GetProductsParams = {
  categorySlug?: string;
  search?: string;
  sort?: ProductSortOption;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

export function getCategories() {
  return fetchJson<Category[]>("/categories");
}

export function getProducts(options: GetProductsParams = {}) {
  const params = new URLSearchParams();

  if (options.categorySlug) {
    params.set("category", options.categorySlug);
  }

  if (options.search) {
    params.set("search", options.search);
  }

  if (options.sort && options.sort !== "newest") {
    params.set("sort", options.sort);
  }

  const query = params.toString();

  return fetchJson<ProductsResponse>(`/products${query ? `?${query}` : ""}`);
}

export function getProductById(productId: number) {
  return fetchJson<Product>(`/products/${productId}`);
}

export function formatPrice(priceInPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(priceInPaise / 100);
}
