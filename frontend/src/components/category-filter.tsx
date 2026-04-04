import { Category } from "@/lib/api";

type CategoryFilterProps = {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  disabled?: boolean;
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  disabled = false,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => onSelectCategory("")}
        disabled={disabled}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
          selectedCategory === ""
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        All products
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelectCategory(category.slug)}
          disabled={disabled}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            selectedCategory === category.slug
              ? "border-amber-600 bg-amber-50 text-amber-900"
              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
