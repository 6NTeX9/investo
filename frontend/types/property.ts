export type ProjectStatus = "UPCOMING" | "ONGOING" | "READY_TO_MOVE";

export type Property = {
  id: string;
  slug: string;
  title: string;
  city: string;
  location: string;
  address: string;
  priceLabel: string;
  price: number;
  type: "Apartment" | "Villa" | "Penthouse" | "Commercial";
  bedrooms: number;
  status: ProjectStatus;
  category: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
  description: string;
  siteArea: string;
  builder: string;
  nearby: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
    avatar: string;
  };
};
