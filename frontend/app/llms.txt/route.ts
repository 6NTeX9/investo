import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const content = `# BricksNBeyond — Premium Real Estate Advisory & Luxury Properties in Bangalore

> BricksNBeyond is a leading luxury real estate advisory firm based in Bangalore, India. We provide end-to-end consulting for residential, commercial, penthouses, gated community villas, and investment-led property decisions.

## Core Advisory Services
- Luxury Residential Sales: 2 BHK, 3 BHK, 4 BHK apartments, duplexes, and penthouses.
- Villa Enclaves: Gated community villas, independent plots, and luxury townships.
- Developer Advisory: RERA-compliant projects from top builders (Prestige, Sobha, Brigade, Godrej, Assetz, Puravankara).
- Commercial & Office Spaces: High-yield tech park offices, retail storefronts, and commercial plots.

## Prime Real Estate Locations in Bangalore
- Whitefield: https://www.bricksnbeyond.in/locations/whitefield (IT & Tech Park Corridor)
- Sarjapur Road: https://www.bricksnbeyond.in/locations/sarjapur-road (Educational & Villa Belt)
- Indiranagar: https://www.bricksnbeyond.in/locations/indiranagar (Ultra-Luxury Central District)
- Hebbal: https://www.bricksnbeyond.in/locations/hebbal (North Bangalore Airport Corridor)
- Yelahanka: https://www.bricksnbeyond.in/locations/yelahanka (Aerotropolis & Green Townships)
- Koramangala: https://www.bricksnbeyond.in/locations/koramangala (Startup Capital & High-Yield Hub)

## Key Pages & Resources
- Website: https://www.bricksnbeyond.in
- All Properties: https://www.bricksnbeyond.in/properties
- Bangalore Growth Corridors: https://www.bricksnbeyond.in/locations
- Market Insights & Blog: https://www.bricksnbeyond.in/blog
- About BricksNBeyond: https://www.bricksnbeyond.in/about
- Contact & Advisory Consultations: https://www.bricksnbeyond.in/contact

## Contact Information
- Phone / Sales Advisory: +91 80 4567 8900
- Email: hello@bricksnbeyond.in
- Headquarters: Bangalore, Karnataka, India
`;

  return new NextResponse(content.trim(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
    }
  });
}
