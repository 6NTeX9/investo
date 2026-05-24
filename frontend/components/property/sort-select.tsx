"use client";

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select 
      name="sort" 
      defaultValue={defaultValue}
      onChange={(e) => {
        e.target.form?.submit();
      }}
      className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm bg-white text-black"
    >
      <option value="newest">Newest listings</option>
      <option value="price_asc">Price low to high</option>
      <option value="price_desc">Price high to low</option>
    </select>
  );
}
