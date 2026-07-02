"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type SearchPanelProperty = {
  city?: string;
  location?: string;
};

function CustomDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="grid gap-0.5 md:gap-1 rounded-md border border-black/5 bg-white px-2.5 py-1.5 md:px-4 md:py-3 text-[8px] sm:text-[9px] md:text-xs font-semibold text-[#b89658] uppercase tracking-wider cursor-pointer hover:bg-neutral-50/50 hover:shadow-sm transition-all duration-300 select-none"
      >
        <span className="text-[#68625a] lowercase first-letter:uppercase md:uppercase md:text-[#b89658] flex justify-between items-center w-full">
          {label}
          <ChevronDown size={10} className={`text-[#b89658] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </span>
        <span className="text-[10px] md:text-sm font-medium text-[#171717] truncate block mt-0.5 normal-case">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 z-[200] mt-1 max-h-60 overflow-y-auto rounded-lg border border-black/5 bg-white p-1 shadow-xl luxury-shadow"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer rounded-md px-3 py-2 text-left text-xs md:text-sm transition-colors ${
                  value === opt.value
                    ? "bg-[#b89658]/10 text-[#b89658] font-semibold"
                    : "text-[#171717] hover:bg-neutral-50"
                }`}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SearchPanel({ properties = [] }: { properties?: SearchPanelProperty[] }) {
  const locations = useMemo(
    () => [...new Set(properties.map((property) => property.location).filter(Boolean))] as string[],
    [properties]
  );

  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [minArea, setMinArea] = useState("");
  const [budgetRange, setBudgetRange] = useState("");

  const typeOptions = [
    { label: "Any type", value: "" },
    { label: "Apartment", value: "APARTMENT" },
    { label: "Villa", value: "VILLA" },
    { label: "Penthouse", value: "PENTHOUSE" },
    { label: "Commercial", value: "COMMERCIAL" },
    { label: "Plot", value: "PLOT" },
  ];

  const locationOptions = useMemo(() => [
    { label: "Any district", value: "" },
    ...locations.map((loc) => ({ label: loc, value: loc })),
  ], [locations]);

  const areaOptions = [
    { label: "Any size", value: "" },
    { label: "500+ sqft", value: "500" },
    { label: "900+ sqft", value: "900" },
    { label: "1200+ sqft", value: "1200" },
    { label: "1500+ sqft", value: "1500" },
    { label: "2000+ sqft", value: "2000" },
    { label: "3000+ sqft", value: "3000" },
  ];

  const budgetOptions = [
    { label: "Any budget", value: "" },
    { label: "Under ₹ 1 Cr", value: "under_1cr" },
    { label: "₹ 1 Cr - 2 Cr", value: "1cr_2cr" },
    { label: "₹ 2 Cr - 3 Cr", value: "2cr_3cr" },
    { label: "₹ 3 Cr - 5 Cr", value: "3cr_5cr" },
    { label: "₹ 5 Cr - 10 Cr", value: "5cr_10cr" },
    { label: "₹ 10 Cr +", value: "over_10cr" },
  ];

  // Map budget range state to minPrice and maxPrice query parameters
  let minPrice = "";
  let maxPrice = "";
  if (budgetRange === "under_1cr") {
    maxPrice = "10000000";
  } else if (budgetRange === "1cr_2cr") {
    minPrice = "10000000";
    maxPrice = "20000000";
  } else if (budgetRange === "2cr_3cr") {
    minPrice = "20000000";
    maxPrice = "30000000";
  } else if (budgetRange === "3cr_5cr") {
    minPrice = "30000000";
    maxPrice = "50000000";
  } else if (budgetRange === "5cr_10cr") {
    minPrice = "50000000";
    maxPrice = "100000000";
  } else if (budgetRange === "over_10cr") {
    minPrice = "100000000";
  }

  return (
    <form action="/properties" className="glass grid grid-cols-1 gap-4 rounded-xl p-3 shadow-2xl md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:gap-3 transition-all duration-500">
      {/* Hidden inputs to bind custom dropdown values to native form submission */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="minArea" value={minArea} />
      <input type="hidden" name="minPrice" value={minPrice} />
      <input type="hidden" name="maxPrice" value={maxPrice} />

      <div className="grid grid-cols-4 gap-1.5 w-full md:contents">
        <CustomDropdown
          label="Type"
          value={type}
          onChange={setType}
          options={typeOptions}
          placeholder="Any type"
        />

        <CustomDropdown
          label="Location"
          value={location}
          onChange={setLocation}
          options={locationOptions}
          placeholder="Any district"
        />

        <CustomDropdown
          label="Size/Area"
          value={minArea}
          onChange={setMinArea}
          options={areaOptions}
          placeholder="Any size"
        />

        <CustomDropdown
          label="Budget"
          value={budgetRange}
          onChange={setBudgetRange}
          options={budgetOptions}
          placeholder="Any budget"
        />
      </div>

      <div className="flex gap-2 w-full md:contents">
        <Link 
          href="/properties" 
          className="flex items-center justify-center gap-1.5 rounded-md border border-[#b89658]/30 px-4 py-2 text-xs font-semibold text-[#b89658] hover:bg-[#b89658]/5 transition flex-1 h-10 min-h-10 md:hidden"
        >
          <SlidersHorizontal size={13} />
          Filters
        </Link>
        <Button type="submit" variant="gold" className="gap-2 flex-1 md:flex-initial h-10 md:h-auto text-xs md:text-sm transition-transform active:scale-95 duration-200">
          <Search size={15} />
          Search
        </Button>
      </div>
    </form>
  );
}
