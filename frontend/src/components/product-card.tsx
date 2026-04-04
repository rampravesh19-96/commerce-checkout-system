import { Product, formatPrice } from "@/lib/api";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const summary = product.shortDescription || product.description;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-slate-100">
<img
  src={product.thumbnailUrl}
  alt={product.name}
  className="h-full w-full object-cover"
/>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            {product.category.name}
          </span>
          <span className="text-lg font-semibold text-slate-900">
            {formatPrice(product.priceInPaise)}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">{summary}</p>
        </div>
      </div>
    </article>
  );
}
