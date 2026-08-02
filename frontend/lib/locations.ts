export type LocationData = {
  slug: string;
  name: string;
  tagline: string;
  region: string;
  district: string;
  avgPriceSqft: string;
  priceRange: string;
  growthRate: string;
  metroStatus: string;
  airportDistance: string;
  heroImage: string;
  highlights: string[];
  description: string;
  keyProjects: string[];
  topAttractions: string[];
  metaTitle: string;
  metaDescription: string;
};

export const LOCATIONS: LocationData[] = [
  {
    slug: "whitefield",
    name: "Whitefield",
    tagline: "East Bangalore's Premier Tech & Luxury Living Hub",
    region: "East Bangalore",
    district: "Bengaluru Urban",
    avgPriceSqft: "₹ 8,500 - ₹ 14,500",
    priceRange: "₹ 90 L - ₹ 6.5 Cr",
    growthRate: "14.2% YoY",
    metroStatus: "Namma Metro Purple Line Active",
    airportDistance: "38 km (via SH-104)",
    heroImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "Home to International Tech Park Bangalore (ITPB) & Export Promotion Industrial Zone",
      "Seamless Namma Metro Purple Line connectivity to Central Bangalore",
      "Top-tier international schools like Ryan International & Vydehi Institute",
      "World-class shopping destinations including Phoenix Marketcity & VR Bengaluru"
    ],
    description: "Whitefield has evolved from a quiet Anglo-Indian settlement into Bangalore's premier IT and luxury residential epicenter. With major tech parks housing global giants, premium shopping malls, top-rated healthcare facilities, and direct Namma Metro Purple Line connectivity, Whitefield commands high rental yields and steady capital appreciation.",
    keyProjects: ["Prestige Shantiniketan", "Sobha Windsor", "Godrej Splendour", "Brigade Woods"],
    topAttractions: ["ITPB Tech Park", "Phoenix Marketcity", "Manipal Hospital", "The Den Hotel"],
    metaTitle: "Luxury Apartments & Flats in Whitefield, Bangalore | BricksNBeyond",
    metaDescription: "Discover luxury 2, 3 & 4 BHK apartments, penthouses, and gated community villas in Whitefield, Bangalore. Verified properties with metro connectivity."
  },
  {
    slug: "sarjapur-road",
    name: "Sarjapur Road",
    tagline: "Bangalore's Fast-Growing Tech & Educational Corridor",
    region: "East/South-East Bangalore",
    district: "Bengaluru Urban",
    avgPriceSqft: "₹ 7,800 - ₹ 13,200",
    priceRange: "₹ 85 L - ₹ 5.5 Cr",
    growthRate: "15.8% YoY",
    metroStatus: "Upcoming Metro Phase 3 Line",
    airportDistance: "48 km",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "Direct arterial connectivity to Wipro SEZ, Outer Ring Road & Electronic City",
      "Hub for premier educational institutions like Indus International & TISB",
      "Rapidly appreciating villa enclaves and luxury high-rise gated communities",
      "Proximity to Bellandur IT corridor & Sarjapur SEZ development"
    ],
    description: "Sarjapur Road is one of Bangalore's most sought-after residential corridors, offering exceptional connectivity to Outer Ring Road, Electronic City, and Marathahalli. Renowned for its top-tier international schools and sprawling villa townships, it is a prime choice for families and tech professionals seeking high ROI.",
    keyProjects: ["Prestige City", "Assetz Marq", "Mana Capitol", "Sobha Royal Pavilion"],
    topAttractions: ["Wipro Campus", "Indus International School", "Columbia Asia Hospital", "Carmelaram Station"],
    metaTitle: "Luxury Villas & Apartments in Sarjapur Road, Bangalore | BricksNBeyond",
    metaDescription: "Explore premium villas, 3 BHK flats & high-yield residential properties on Sarjapur Road, Bangalore. Top RERA projects & market analysis."
  },
  {
    slug: "indiranagar",
    name: "Indiranagar",
    tagline: "Bangalore's Ultimate Heritage & High-Street Luxury District",
    region: "Central Bangalore",
    district: "Bengaluru Urban",
    avgPriceSqft: "₹ 16,000 - ₹ 26,000",
    priceRange: "₹ 2.5 Cr - ₹ 15 Cr+",
    growthRate: "11.5% YoY",
    metroStatus: "Namma Metro Purple Line Active (Indiranagar Station)",
    airportDistance: "36 km",
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "100 Feet Road & 12th Main: India's most famous high-street shopping & dining avenue",
      "Ultra-exclusive independent bungalows, penthouses, and boutique luxury apartments",
      "Unmatched central location minutes away from MG Road, Koramangala & Domlur",
      "Direct Metro connectivity via Indiranagar and Swami Vivekananda stations"
    ],
    description: "Indiranagar represents the pinnacle of luxury, lifestyle, and legacy in Bangalore. Featuring leafy avenues, Michelin-star dining, designer boutiques, and prime commercial headquarters, owning property in Indiranagar is a symbol of prestige and perpetual high value.",
    keyProjects: ["Prestige Tech Park", "Bespoke Indiranagar Residences", "Legacy Caster"],
    topAttractions: ["100 Feet Road High Street", "Toit Brewpub", "CMH Hospital", "Indiranagar Club"],
    metaTitle: "Luxury Penthouses & Apartments in Indiranagar, Bangalore | BricksNBeyond",
    metaDescription: "Exclusive luxury apartments, penthouses, and premium properties in Indiranagar, Bangalore. Prime central real estate advisory by BricksNBeyond."
  },
  {
    slug: "hebbal",
    name: "Hebbal",
    tagline: "North Bangalore's Scenic Gateway & Waterfront Luxury Hub",
    region: "North Bangalore",
    district: "Bengaluru Urban",
    avgPriceSqft: "₹ 9,500 - ₹ 16,800",
    priceRange: "₹ 1.2 Cr - ₹ 8.5 Cr",
    growthRate: "16.4% YoY",
    metroStatus: "Upcoming Blue Line Airport Metro Link",
    airportDistance: "26 km (Direct Flyover)",
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "Gateway to Kempegowda International Airport via Hebbal Flyover & Bellary Road",
      "Stunning lakefront luxury residences overlooking Hebbal Lake",
      "Proximity to Manyata Tech Park housing 150,000+ IT professionals",
      "Fastest growing commercial office & luxury residential hub in North Bangalore"
    ],
    description: "Hebbal has transformed into North Bangalore's flagship real estate destination. Strategic proximity to Kempegowda International Airport, Manyata Tech Park, and the Hebbal lakefront makes it a magnet for high-net-worth investors and senior IT executives.",
    keyProjects: ["Godrej Woodsman Estate", "L&T Raintree Boulevard", "Prestige Misty Waters", "Brigade Caladium"],
    topAttractions: ["Hebbal Lake Park", "Manyata Tech Park", "Aster CMI Hospital", "Esteem Mall"],
    metaTitle: "Lakefront Apartments & Properties in Hebbal, Bangalore | BricksNBeyond",
    metaDescription: "Browse lakefront luxury apartments, 3 BHK & 4 BHK flats in Hebbal, North Bangalore. Minutes from Manyata Tech Park & Airport Expressway."
  },
  {
    slug: "yelahanka",
    name: "Yelahanka",
    tagline: "Aerotropolis Growth Hub & Green Living Corridor",
    region: "North Bangalore",
    district: "Bengaluru Urban",
    avgPriceSqft: "₹ 6,800 - ₹ 11,500",
    priceRange: "₹ 65 L - ₹ 4.5 Cr",
    growthRate: "17.1% YoY",
    metroStatus: "Upcoming Airport Metro Blue Line",
    airportDistance: "18 km",
    heroImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "Unbeatable location just 15 minutes from International Airport",
      "Massive infrastructure boom with Aerotropolis & Hardware Park developments",
      "Excellent educational institutes like Srishti Institute & Raman Research Institute",
      "Lush greenery, clean air, and self-contained township living"
    ],
    description: "Yelahanka is leading North Bangalore's real estate boom. Positioned perfectly between Hebbal and the International Airport, Yelahanka offers sprawling green developments, luxury golf villas, and high-rise apartments backed by infrastructure growth.",
    keyProjects: ["Prestige Garden Enclave", "Purva Venezia", "Sobha Palm Court", "Godrej Avenues"],
    topAttractions: ["Yelahanka Air Force Station", "RMZ Galleria Mall", "Ramanashree California Club"],
    metaTitle: "Apartments & Gated Villas in Yelahanka, Bangalore | BricksNBeyond",
    metaDescription: "Find top-rated gated community apartments and luxury villas in Yelahanka, North Bangalore. Rapid airport corridor appreciation."
  },
  {
    slug: "koramangala",
    name: "Koramangala",
    tagline: "India's Tech Startup Capital & Cosmopolitan Lifestyle Hotspot",
    region: "South Bangalore",
    district: "Bengaluru Urban",
    avgPriceSqft: "₹ 14,000 - ₹ 22,000",
    priceRange: "₹ 1.8 Cr - ₹ 12 Cr+",
    growthRate: "12.1% YoY",
    metroStatus: "Yellow Line Metro Operational Soon",
    airportDistance: "41 km",
    heroImage: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "India's premier startup nexus housing top tech unicorns & venture funds",
      "Unrivaled social infrastructure, cafes, pubs, and Forum Mall",
      "High rental demand driven by founders, executives, and expatriates",
      "Seamless connectivity to HSR Layout, Indiranagar, and Electronic City"
    ],
    description: "Koramangala is synonymous with innovation, youth culture, and high-end living. Divided into 8 premium blocks, Koramangala commands exceptionally strong residential demand and premium capital valuation due to its strategic South Bangalore location.",
    keyProjects: ["Raheja Residency", "Prestige Acropolis", "Sobha Morzaria Grandeur"],
    topAttractions: ["Nexus Forum Mall", "Koramangala Club", "Jyoti Nivas College", "Startup Hub Block 3 & 4"],
    metaTitle: "Luxury Apartments & Properties in Koramangala, Bangalore | BricksNBeyond",
    metaDescription: "Explore luxury residential properties and high-yield apartments in Koramangala, South Bangalore. Premium advisory by BricksNBeyond."
  }
];

export function getLocationBySlug(slug: string): LocationData | undefined {
  return LOCATIONS.find((loc) => loc.slug === slug.toLowerCase());
}
