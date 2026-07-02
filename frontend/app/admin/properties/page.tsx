"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import axios from "axios";
import { uploadFiles } from "@/lib/uploadthing";
import { parseIndianPrice, formatCurrency, convertToMapEmbedUrl } from "@/lib/utils";
import { 
  Building2, Plus, Search, Edit, Trash2, X, Loader2, 
  UploadCloud, CheckCircle2, AlertTriangle, Sparkles, SlidersHorizontal 
} from "lucide-react";

type PropertyType = "APARTMENT" | "VILLA" | "PENTHOUSE" | "COMMERCIAL" | "PLOT";
type ProjectStatus = "UPCOMING" | "ONGOING" | "READY_TO_MOVE";

interface PropertyImage {
  id?: string;
  url: string;
  key: string;
  alt?: string;
  sortOrder: number;
  type?: "IMAGE" | "VIDEO" | "BROCHURE" | "FLOOR_PLAN" | "MASTER_PLAN";
}

interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  location: string;
  type: PropertyType;
  status: ProjectStatus;
  bedrooms?: number | null;
  bathrooms?: number | null;
  siteArea?: string | null;
  constructionStatus?: string | null;
  builderName?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  categoryId?: string | null;
  agentId?: string | null;
  amenities: string[];
  nearbyLandmarks: string[];
  images: PropertyImage[];
  mapLink?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

export default function AdminPropertiesPage() {
  // Lists
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  
  // Loading & Filtering
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  // CRUD panel state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<PropertyType>("APARTMENT");
  const [status, setStatus] = useState<ProjectStatus>("ONGOING");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [siteArea, setSiteArea] = useState("");
  const [constructionStatus, setConstructionStatus] = useState("");
  const [builderName, setBuilderName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [amenitiesText, setAmenitiesText] = useState("");
  const [landmarksText, setLandmarksText] = useState("");
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [uploadingDocType, setUploadingDocType] = useState<"BROCHURE" | "FLOOR_PLAN" | "MASTER_PLAN" | null>(null);
  
  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Track slug manual editing
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authenticate & initial fetch
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catsRes, agentsRes] = await Promise.all([
          api.get("/properties/categories"),
          api.get("/agents")
        ]);
        setCategories(catsRes.data);
        setAgents(agentsRes.data);
      } catch (err) {
        console.error("Failed to load options:", err);
        toast.error("Failed to load category or agent select options.");
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch properties list
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("includeUnpublished", "true");
      params.append("page", page.toString());
      params.append("limit", itemsPerPage.toString());
      if (search) params.append("q", search);
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`/properties?${params.toString()}`);
      setProperties(res.data.items);
      setTotalPages(res.data.meta.pageCount || 1);
    } catch (err) {
      console.error("Failed to load properties:", err);
      toast.error("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  };

  // Helper to slugify
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Auto slug update
  useEffect(() => {
    if (!editingProperty && !isSlugEdited) {
      setSlug(slugify(title));
    }
  }, [title, editingProperty, isSlugEdited]);

  // Open create drawer
  const handleOpenCreate = () => {
    setEditingProperty(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setPrice("");
    setAddress("");
    setCity("Mumbai");
    setLocation("");
    setType("APARTMENT");
    setStatus("ONGOING");
    setBedrooms("");
    setBathrooms("");
    setSiteArea("");
    setConstructionStatus("");
    setBuilderName("");
    setCategoryId(categories[0]?.id || "");
    setAgentId(agents[0]?.id || "");
    setIsFeatured(false);
    setIsPublished(false);
    setAmenitiesText("");
    setLandmarksText("");
    setImages([]);
    setManualImageUrl("");
    setMapLink("");
    setIsSlugEdited(false);
    
    setDrawerOpen(true);
  };

  // Open edit drawer
  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setTitle(property.title);
    setSlug(property.slug);
    setDescription(property.description);
    setPrice(property.price.toString());
    setAddress(property.address);
    setCity(property.city);
    setLocation(property.location);
    setType(property.type);
    setStatus(property.status);
    setBedrooms(property.bedrooms?.toString() || "");
    setBathrooms(property.bathrooms?.toString() || "");
    setSiteArea(property.siteArea || "");
    setConstructionStatus(property.constructionStatus || "");
    setBuilderName(property.builderName || "");
    setCategoryId(property.categoryId || "");
    setAgentId(property.agentId || "");
    setIsFeatured(property.isFeatured);
    setIsPublished(property.isPublished);
    setAmenitiesText(property.amenities.join(", "));
    setLandmarksText(property.nearbyLandmarks.join(", "));
    setImages(property.images || []);
    setManualImageUrl("");
    setMapLink(property.mapLink || "");
    setIsSlugEdited(true);

    setDrawerOpen(true);
  };

  // Image manual addition
  const handleAddManualImage = () => {
    if (!manualImageUrl) return;
    
    // Check url validity basic
    if (!manualImageUrl.startsWith("http://") && !manualImageUrl.startsWith("https://")) {
      toast.error("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }

    const key = `manual/${Date.now()}`;
    const newImage: PropertyImage = {
      url: manualImageUrl,
      key: key,
      alt: title + " Image",
      sortOrder: images.length
    };

    setImages([...images, newImage]);
    setManualImageUrl("");
    toast.success("Image URL added manually.");
  };

  // UploadThing upload handler
  const handleS3Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Direct upload to UploadThing using our typed helper
      const res = await uploadFiles("imageUploader", {
        files: [file]
      });

      if (!res || res.length === 0) {
        throw new Error("No files returned from UploadThing");
      }

      const uploadedFile = res[0];

      // Update images state
      const newImage: PropertyImage = {
        url: uploadedFile.url,
        key: uploadedFile.key,
        alt: file.name,
        sortOrder: images.length
      };
      
      setImages([...images, newImage]);
      toast.success("Image uploaded successfully via UploadThing.");
    } catch (err: any) {
      console.error("UploadThing upload failed:", err);
      toast.error("Upload failed. Please use the direct URL input fallback below.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Image remove
  const handleRemoveImage = (key: string) => {
    setImages(images.filter((img) => img.key !== key));
  };

  // Document Upload Handler (for Brochure, Floor Plan, Master Plan)
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "BROCHURE" | "FLOOR_PLAN" | "MASTER_PLAN") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocType(type);
    try {
      const res = await uploadFiles("documentUploader", {
        files: [file]
      });

      if (!res || res.length === 0) {
        throw new Error("No files returned from UploadThing");
      }

      const uploadedFile = res[0];

      // Remove existing doc of same type
      const filtered = images.filter((img) => img.type !== type);

      const newDoc: PropertyImage = {
        url: uploadedFile.url,
        key: uploadedFile.key,
        alt: `${type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}: ${file.name}`,
        sortOrder: filtered.length,
        type: type
      };

      setImages([...filtered, newDoc]);
      toast.success(`${type.replace("_", " ")} uploaded successfully!`);
    } catch (err: any) {
      console.error(`${type} upload failed:`, err);
      toast.error(`Failed to upload ${type.replace("_", " ")}.`);
    } finally {
      setUploadingDocType(null);
      e.target.value = "";
    }
  };

  // Document removal
  const handleRemoveDocument = (type: "BROCHURE" | "FLOOR_PLAN" | "MASTER_PLAN") => {
    setImages(images.filter((img) => img.type !== type));
    toast.success(`${type.replace("_", " ")} removed.`);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !slug || !price || !description || !address || !city || !location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    
    // Parse arrays
    const amenities = amenitiesText.split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);
      
    const nearbyLandmarks = landmarksText.split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    let cleanedMapLink = mapLink.trim();
    if (cleanedMapLink.startsWith("<iframe")) {
      const match = cleanedMapLink.match(/src="([^"]+)"/);
      if (match && match[1]) {
        cleanedMapLink = match[1];
      }
    }

    const payload = {
      title,
      slug,
      description,
      price: parseIndianPrice(price),
      address,
      city,
      location,
      mapLink: cleanedMapLink || null,
      type,
      status,
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      siteArea: siteArea || null,
      constructionStatus: constructionStatus || null,
      builderName: builderName || null,
      categoryId: categoryId || null,
      agentId: agentId || null,
      isFeatured,
      isPublished,
      amenities,
      nearbyLandmarks,
      images: images.map((img, idx) => ({
        url: img.url,
        key: img.key,
        alt: img.alt || title + " image",
        sortOrder: idx
      }))
    };

    try {
      if (editingProperty) {
        await api.patch(`/properties/${editingProperty.id}`, payload);
        toast.success("Property updated successfully!");
      } else {
        await api.post("/properties", payload);
        toast.success("Property created successfully!");
      }
      setDrawerOpen(false);
      fetchProperties();
    } catch (err: any) {
      console.error("Error saving property:", err);
      const message = err.response?.data?.message ?? "Failed to save property.";
      const displayMessage = Array.isArray(message) ? message[0] : message;
      toast.error(displayMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/properties/${deleteConfirmId}`);
      toast.success("Property deleted successfully.");
      setDeleteConfirmId(null);
      fetchProperties();
    } catch (err: any) {
      console.error("Error deleting property:", err);
      toast.error(err.response?.data?.message ?? "Failed to delete property.");
    } finally {
      setDeleting(false);
    }
  };

  const galleryImages = images.filter((img) => !img.type || img.type === "IMAGE");
  const brochureFile = images.find((img) => img.type === "BROCHURE");
  const floorPlanFile = images.find((img) => img.type === "FLOOR_PLAN");
  const masterPlanFile = images.find((img) => img.type === "MASTER_PLAN");

  return (
    <main className="section-shell pt-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Investo listings</p>
          <h1 className="mt-2 text-3xl font-semibold">Properties</h1>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-md bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] active:bg-black"
        >
          <Plus size={16} />
          <span>Add Property</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mt-8 grid gap-4 rounded-lg bg-white p-4 border border-black/5 luxury-shadow md:grid-cols-[1fr_200px_200px_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68625a]" />
          <input
            type="text"
            placeholder="Search by title, description or builder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full focus-ring rounded-md border border-black/10 py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="focus-ring rounded-md border border-black/10 px-3 py-2.5 text-sm bg-white"
        >
          <option value="">All types</option>
          <option value="APARTMENT">Apartment</option>
          <option value="VILLA">Villa</option>
          <option value="PENTHOUSE">Penthouse</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="PLOT">Plot</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="focus-ring rounded-md border border-black/10 px-3 py-2.5 text-sm bg-white"
        >
          <option value="">All statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="READY_TO_MOVE">Ready to Move</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-[#b89658] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a38144] transition"
        >
          Search
        </button>
      </form>

      {/* Properties Table */}
      <div className="mt-6 overflow-hidden rounded-lg bg-white border border-black/5 luxury-shadow">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-4">
                  <div className="h-16 w-20 rounded bg-black/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-black/5" />
                    <div className="h-3 w-1/4 rounded bg-black/5" />
                  </div>
                  <div className="h-8 w-20 rounded bg-black/5" />
                  <div className="h-8 w-20 rounded bg-black/5" />
                </div>
              ))}
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="grid place-items-center py-20 text-center">
            <Building2 size={48} className="text-[#b89658]/40" />
            <h3 className="mt-4 font-semibold text-lg">No properties found</h3>
            <p className="mt-1 text-sm text-[#68625a]">Try clearing search parameters or add a new property record.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table view */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-[#f7f4ee] font-semibold text-[#68625a]">
                    <th className="p-4">Property</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Type & Status</th>
                    <th className="p-4 text-right">Price (₹)</th>
                    <th className="p-4 text-center">Listing</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-[#fcfbfa] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 overflow-hidden rounded border border-black/5 bg-black/5 flex-shrink-0">
                            {property.images?.[0] ? (
                              <img 
                                src={property.images[0].url} 
                                alt={property.title} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-black/20">
                                <Building2 size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-base text-[#171717]">{property.title}</p>
                            <p className="text-xs text-[#68625a] font-mono">{property.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-[#171717]">{property.location}</p>
                        <p className="text-xs text-[#68625a]">{property.city}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[#171717]">{property.type}</span>
                          <span className="text-[10px] text-[#68625a] font-medium uppercase bg-black/5 w-max px-1.5 py-0.5 rounded">
                            {property.status.replaceAll("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-semibold text-[#171717]">
                        {formatCurrency(Number(property.price))}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {property.isPublished ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                              Draft
                            </span>
                          )}
                          {property.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#b89658]">
                              <Sparkles size={10} />
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(property)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(property.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card view */}
            <div className="block md:hidden divide-y divide-black/5 bg-white">
              {properties.map((property) => (
                <div key={property.id} className="p-4 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="h-16 w-20 overflow-hidden rounded border border-black/5 bg-black/5 flex-shrink-0">
                      {property.images?.[0] ? (
                        <img 
                          src={property.images[0].url} 
                          alt={property.title} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-black/20">
                          <Building2 size={24} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-[#171717] leading-tight truncate">{property.title}</h3>
                        <span className="font-semibold text-[#171717] text-xs shrink-0">
                          {formatCurrency(Number(property.price))}
                        </span>
                      </div>
                      <p className="text-xs text-[#68625a] mt-1 truncate">
                        {property.location}, {property.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs border-t border-black/5 pt-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[#171717] text-xs">{property.type}</span>
                      <span className="text-[9px] text-[#68625a] font-medium uppercase bg-black/5 px-1.5 py-0.5 rounded w-max">
                        {property.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {property.isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700 border border-emerald-100">
                          <span className="h-1 w-1 rounded-full bg-emerald-600" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-medium text-amber-700 border border-amber-100">
                          <span className="h-1 w-1 rounded-full bg-amber-600" />
                          Draft
                        </span>
                      )}
                      {property.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-[#b89658]">
                          <Sparkles size={8} />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(property)}
                        className="flex items-center gap-1 rounded border border-black/10 px-2.5 py-1 text-xs font-semibold text-[#b89658] hover:bg-[#b89658]/5 transition"
                        title="Edit"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(property.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded border border-red-100 transition"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-[#68625a]">
            Showing page <span className="font-semibold text-[#171717]">{page}</span> of <span className="font-semibold text-[#171717]">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Drawer Panel for Add/Edit */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${drawerOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div 
          onClick={() => !submitting && setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`} 
        />
        
        {/* Panel Container */}
        <div className={`absolute bottom-0 right-0 top-0 w-full max-w-3xl bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 p-5">
            <div>
              <h2 className="text-xl font-semibold text-[#171717]">
                {editingProperty ? `Edit listing: ${editingProperty.title}` : "Add property listing"}
              </h2>
              <p className="text-xs text-[#68625a] mt-0.5">Manage premium discovery inventory details.</p>
            </div>
            <button 
              disabled={submitting}
              onClick={() => setDrawerOpen(false)} 
              className="p-1 text-[#68625a] hover:bg-black/5 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Scroll Container */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                1. Basic Info
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="e.g. Zenith Heights"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Slug (URL Safe ID) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugEdited(true);
                    }}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50 font-mono"
                    placeholder="zenith-heights"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Price (₹) *</label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50 bg-white text-black"
                    placeholder="e.g. 1.25 cr or 50L"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Property Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm bg-white focus:border-[#b89658]/50"
                  >
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                    <option value="PENTHOUSE">Penthouse</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="PLOT">Plot</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Project Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm bg-white focus:border-[#b89658]/50"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="READY_TO_MOVE">Ready to Move</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Location & Structure Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                2. Address & Physical Info
              </h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Location / Community *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="e.g. Downtown Dubai"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="e.g. Dubai"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Full Street Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="e.g. Sheikh Mohammed Bin Rashid Blvd"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Google Maps Link / Embed Code (Optional)</label>
                <input
                  type="text"
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50 bg-white text-black"
                  placeholder="Paste Google Maps share link, place URL or iframe embed code"
                />
                <p className="text-[11px] text-[#68625a]">
                  Tip: On Google Maps, click Share → Copy link — then paste here. Or use the &quot;Embed a map&quot; option for iframe code.
                </p>
                {/* Live Map Preview */}
                {(mapLink || address) && (() => {
                  const previewUrl = convertToMapEmbedUrl(mapLink, address);
                  if (!previewUrl) return null;
                  return (
                    <div className="mt-1 overflow-hidden rounded border border-black/10 bg-black/5">
                      <p className="px-2 py-1 text-[10px] font-semibold text-[#68625a] uppercase tracking-wide border-b border-black/5">Map Preview</p>
                      <iframe
                        title="Map preview"
                        src={previewUrl}
                        className="h-52 w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  );
                })()}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="3"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="4"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Site Area (e.g. sqft)</label>
                  <input
                    type="text"
                    value={siteArea}
                    onChange={(e) => setSiteArea(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="2,400 sq ft"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Construction progress</label>
                  <input
                    type="text"
                    value={constructionStatus}
                    onChange={(e) => setConstructionStatus(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="60% complete"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: CMS Taxonomy & Meta */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                3. Taxonomy & Assignment
              </h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Builder Name</label>
                  <input
                    type="text"
                    value={builderName}
                    onChange={(e) => setBuilderName(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="e.g. Emaar"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Property Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm bg-white focus:border-[#b89658]/50"
                  >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Assigned Agent</label>
                  <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm bg-white focus:border-[#b89658]/50"
                  >
                    <option value="">No Agent</option>
                    {agents.map(ag => (
                      <option key={ag.id} value={ag.id}>{ag.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer rounded border border-black/5 p-3 hover:bg-[#fcfbfa]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-black/20 text-[#b89658] focus:ring-[#b89658]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#171717]">Featured Listing</span>
                    <p className="text-[11px] text-[#68625a]">Promoted on public landing page sliders.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer rounded border border-black/5 p-3 hover:bg-[#fcfbfa]">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-black/20 text-[#b89658] focus:ring-[#b89658]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#171717]">Publish Immediately</span>
                    <p className="text-[11px] text-[#68625a]">Make discoverable on public portals.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 4: Details & Media */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                4. Content & Amenities
              </h3>
              
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                  placeholder="Detail the layout, amenities, finishing and highlight luxury key features..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Amenities (comma separated)</label>
                  <input
                    type="text"
                    value={amenitiesText}
                    onChange={(e) => setAmenitiesText(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="Infinity pool, Concierge, Gym, Valet"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Landmarks / Travel Times (comma separated)</label>
                  <input
                    type="text"
                    value={landmarksText}
                    onChange={(e) => setLandmarksText(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="Dubai Mall - 5 min, DXB Airport - 15 min"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Media Gallery */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                5. Media Gallery ({images.length})
              </h3>
              
              {/* S3 Image Uploader component */}
              <label className="block rounded-lg border-2 border-dashed border-black/10 p-5 text-center hover:bg-[#fcfbfa] transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleS3Upload}
                  disabled={uploadingImage}
                  ref={fileInputRef}
                  className="sr-only"
                />
                <div className="flex flex-col items-center gap-2">
                  {uploadingImage ? (
                    <Loader2 className="animate-spin text-[#b89658]" size={28} />
                  ) : (
                    <UploadCloud className="text-[#68625a]" size={28} />
                  )}
                  <div>
                    <span className="text-sm font-semibold text-[#171717]">
                      {uploadingImage ? "Uploading to Cloud..." : "Upload Image to storage"}
                    </span>
                    <p className="text-xs text-[#68625a] mt-0.5">Supports JPEG, PNG, WEBP</p>
                  </div>
                </div>
              </label>

              {/* Direct Url Fallback Input */}
              <div className="flex gap-2 items-end">
                <div className="grid gap-1.5 flex-1">
                  <label className="text-xs font-semibold text-[#68625a]">
                    Direct Image URL Fallback (Use if S3 bucket is unconfigured)
                  </label>
                  <input
                    type="text"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddManualImage}
                  className="rounded border border-[#b89658] px-4 py-2 text-sm font-semibold text-[#b89658] hover:bg-[#b89658]/5 transition h-10 shrink-0"
                >
                  Add URL
                </button>
              </div>

              {/* Uploaded Images List */}
              {galleryImages.length > 0 && (
                <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-3">
                  {galleryImages.map((img, index) => (
                    <div key={img.key} className="relative rounded overflow-hidden border border-black/5 bg-black/5 aspect-video group">
                      <img
                        src={img.url}
                        alt="Property preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.key)}
                          className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          title="Remove image"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[9px] text-white">
                        Order: {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 6: Documents & Plans */}
            <div className="space-y-4 pt-4 border-t border-black/5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                6. Documents &amp; Plans
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Brochure Uploader */}
                <div className="space-y-2 rounded-lg border border-black/5 bg-[#fcfbfa] p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#171717]">Brochure PDF</span>
                    {brochureFile && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument("BROCHURE")}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-0.5"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                  {brochureFile ? (
                    <div className="flex items-center gap-2 rounded bg-white border border-black/5 p-2 text-xs">
                      <span className="text-[#b89658]">📄</span>
                      <a href={brochureFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium truncate flex-1">
                        View Brochure
                      </a>
                    </div>
                  ) : (
                    <label className="block relative border-2 border-dashed border-black/10 rounded-md p-3 text-center hover:bg-black/5 transition cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleDocumentUpload(e, "BROCHURE")}
                        disabled={uploadingDocType !== null}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center gap-1 text-[11px] text-[#68625a]">
                        {uploadingDocType === "BROCHURE" ? (
                          <Loader2 className="animate-spin text-[#b89658]" size={16} />
                        ) : (
                          <UploadCloud size={16} />
                        )}
                        <span>{uploadingDocType === "BROCHURE" ? "Uploading..." : "Upload Brochure PDF"}</span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Floor Plan Uploader */}
                <div className="space-y-2 rounded-lg border border-black/5 bg-[#fcfbfa] p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#171717]">Floor Plan PDF</span>
                    {floorPlanFile && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument("FLOOR_PLAN")}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-0.5"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                  {floorPlanFile ? (
                    <div className="flex items-center gap-2 rounded bg-white border border-black/5 p-2 text-xs">
                      <span className="text-[#b89658]">📄</span>
                      <a href={floorPlanFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium truncate flex-1">
                        View Floor Plan
                      </a>
                    </div>
                  ) : (
                    <label className="block relative border-2 border-dashed border-black/10 rounded-md p-3 text-center hover:bg-black/5 transition cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleDocumentUpload(e, "FLOOR_PLAN")}
                        disabled={uploadingDocType !== null}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center gap-1 text-[11px] text-[#68625a]">
                        {uploadingDocType === "FLOOR_PLAN" ? (
                          <Loader2 className="animate-spin text-[#b89658]" size={16} />
                        ) : (
                          <UploadCloud size={16} />
                        )}
                        <span>{uploadingDocType === "FLOOR_PLAN" ? "Uploading..." : "Upload Floor Plan PDF"}</span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Master Plan Uploader */}
                <div className="space-y-2 rounded-lg border border-black/5 bg-[#fcfbfa] p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#171717]">Master Plan PDF</span>
                    {masterPlanFile && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument("MASTER_PLAN")}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-0.5"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                  {masterPlanFile ? (
                    <div className="flex items-center gap-2 rounded bg-white border border-black/5 p-2 text-xs">
                      <span className="text-[#b89658]">📄</span>
                      <a href={masterPlanFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium truncate flex-1">
                        View Master Plan
                      </a>
                    </div>
                  ) : (
                    <label className="block relative border-2 border-dashed border-black/10 rounded-md p-3 text-center hover:bg-black/5 transition cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleDocumentUpload(e, "MASTER_PLAN")}
                        disabled={uploadingDocType !== null}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center gap-1 text-[11px] text-[#68625a]">
                        {uploadingDocType === "MASTER_PLAN" ? (
                          <Loader2 className="animate-spin text-[#b89658]" size={16} />
                        ) : (
                          <UploadCloud size={16} />
                        )}
                        <span>{uploadingDocType === "MASTER_PLAN" ? "Uploading..." : "Upload Master Plan PDF"}</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

          </form>

          {/* Footer actions */}
          <div className="border-t border-black/10 p-5 bg-[#fcfbfa] flex justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setDrawerOpen(false)}
              className="rounded-md border border-black/10 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-md bg-[#171717] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] active:bg-black disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Property</span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => !deleting && setDeleteConfirmId(null)}
            className="absolute inset-0 bg-black/40" 
          />
          <div className="relative bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl border border-black/5">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="font-semibold text-lg">Confirm Deletion</h3>
            </div>
            <p className="mt-3 text-sm text-[#68625a] leading-relaxed">
              Are you sure you want to permanently delete this property listing? This action is irreversible and will delete all associated media linkages.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setDeleteConfirmId(null)}
                className="rounded border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
