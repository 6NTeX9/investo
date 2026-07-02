import type { Property } from "@/types/property";

export const properties: Property[] = [
  {
    id: "prop_001",
    slug: "altus-residences-skyline-district",
    title: "Altus Residences",
    city: "Mumbai",
    location: "Lower Parel",
    address: "Senapati Bapat Marg, Lower Parel, Mumbai",
    priceLabel: "From ₹ 2.8 Cr",
    price: 28000000,
    type: "Apartment",
    bedrooms: 3,
    status: "ONGOING",
    category: "Luxury properties",
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: ["Infinity pool", "Concierge", "Private lounge", "Gym", "Valet parking"],
    description: "A collection of high-floor residences with panoramic city views, refined material palettes, and a private residents' club.",
    siteArea: "4.8 acres",
    builder: "Investo Developments",
    nearby: ["Palladium Mall - 5 min", "Bandra-Worli Sea Link - 12 min", "Chhatrapati Shivaji Airport - 25 min"],
    agent: {
      name: "Maya Kapoor",
      phone: "+91 98765 43210",
      email: "maya@investoproperties.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=85"
    }
  },
  {
    id: "prop_002",
    slug: "marina-gate-villas",
    title: "Marina Bay Villas",
    city: "Mumbai",
    location: "Worli Waterfront",
    address: "Worli Sea Face, Worli, Mumbai",
    priceLabel: "From ₹ 8.6 Cr",
    price: 86000000,
    type: "Villa",
    bedrooms: 5,
    status: "READY_TO_MOVE",
    category: "Ready-to-move projects",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: ["Private beach access", "Cinema room", "Smart home", "Garden deck", "Boat berth"],
    description: "Waterfront residences with generous indoor-outdoor living, private pools, and direct promenade access.",
    siteArea: "7,900 sq.ft.",
    builder: "Noble Coast Properties",
    nearby: ["Bandra-Worli Sea Link - 3 min", "Worli Fort - 5 min", "Dadar - 10 min"],
    agent: {
      name: "Omar Siddiqui",
      phone: "+91 98765 43214",
      email: "omar@investoproperties.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=85"
    }
  },
  {
    id: "prop_003",
    slug: "one-park-commercial-tower",
    title: "One Park Commercial Tower",
    city: "Mumbai",
    location: "Bandra Kurla Complex",
    address: "G Block, BKC, Bandra East, Mumbai",
    priceLabel: "From ₹ 1.4 Cr",
    price: 14000000,
    type: "Commercial",
    bedrooms: 0,
    status: "UPCOMING",
    category: "Commercial properties",
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: ["Grade-A lobby", "EV parking", "Meeting suites", "Retail podium", "24/7 security"],
    description: "Flexible commercial suites for founders, family offices, and boutique advisory firms in a connected business corridor.",
    siteArea: "32 floors",
    builder: "Civic Stone",
    nearby: ["Dhirubhai Ambani Square - 2 min", "Bandra Station - 8 min", "Chhatrapati Shivaji Airport - 20 min"],
    agent: {
      name: "Elena Rossi",
      phone: "+91 98765 43213",
      email: "elena@investoproperties.com",
      avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=320&q=85"
    }
  }
];

export const testimonials = [
  "The team shortlisted homes that matched our budget and investment horizon with unusual precision.",
  "Site visits, paperwork, and builder negotiations were handled with a level of calm we did not expect.",
  "Investo helped us compare yield, location fundamentals, and exit scenarios before we committed."
];
