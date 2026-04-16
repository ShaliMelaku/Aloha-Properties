export interface PropertyUnit {
  type: string;
  beds: number;
  baths: number;
  sqm: number;
  price: number;
  varietyImg: string;
}

export interface Property {
  id: number;
  name: string;
  location: string;
  developer: string;
  lat: number;
  lng: number;
  amenities: string[];
  units: PropertyUnit[];
}

export interface ProgressInfo {
  progress: number;
  status: 'under-construction' | 'nearing-completion' | 'ready';
  statusText: string;
  estimated: string;
}

const varietyImages = {
  studio: "/images/Bedroom 1.jpg", 
  oneBr: "/images/Bedroom1.jpg",
  twoBr: "/images/Bedroom 2.jpg",
  threeBr: "/images/Bedroom 3.jpg",
  penthouse: "/images/cover.jpg",
  villa: "/images/Cover.webp"
};

export const productProgress: Record<string, ProgressInfo> = {
  "Getas Kazanchis Tower": { progress: 68, status: "under-construction", statusText: "Under Construction", estimated: "Q4 2025" },
  "Getas Summit Residence": { progress: 72, status: "under-construction", statusText: "Under Construction", estimated: "Q1 2026" },
  "Enyi Bulbula Heights": { progress: 85, status: "nearing-completion", statusText: "Nearing Completion", estimated: "Q2 2025" },
  "Enyi Jemo Gardens": { progress: 55, status: "under-construction", statusText: "Under Construction", estimated: "Q3 2026" },
  "Metro Bulbula Tower": { progress: 78, status: "under-construction", statusText: "Under Construction", estimated: "Q4 2025" }
};

export const properties: Property[] = [
  { 
    id: 1, name: "Getas Kazanchis Tower", location: "Kazanchis, Addis Ababa", developer: "Getas Real Estate", lat: 9.0192, lng: 38.7625, 
    amenities: ["24/7 Security", "Elevator", "Parking", "CCTV"], 
    units: [
      { type: "Studio", beds: 0, baths: 1, sqm: 45, price: 2800000, varietyImg: "/images/getas real estate kazanchis site/Bedroom 1.jpg" }, 
      { type: "1 Bedroom", beds: 1, baths: 1, sqm: 65, price: 3800000, varietyImg: "/images/getas real estate kazanchis site/Bedroom 2.jpg" }, 
      { type: "2 Bedroom", beds: 2, baths: 2, sqm: 95, price: 5500000, varietyImg: "/images/getas real estate kazanchis site/Bedroom 3.jpg" }, 
      { type: "3 Bedroom", beds: 3, baths: 2.5, sqm: 135, price: 7800000, varietyImg: "/images/getas real estate kazanchis site/cover.JPG" }
    ] 
  },
  { 
    id: 2, name: "Getas Summit Residence", location: "Summit, Addis Ababa", developer: "Getas Real Estate", lat: 9.0350, lng: 38.7850, 
    amenities: ["Gym", "Pool", "24/7 Security", "Parking"], 
    units: [
      { type: "1 Bedroom", beds: 1, baths: 1, sqm: 72, price: 3200000, varietyImg: "/images/getas real estate Sumit 72 site/Bedroom 1.jpg" }, 
      { type: "2 Bedroom", beds: 2, baths: 2, sqm: 108, price: 5200000, varietyImg: "/images/getas real estate Sumit 72 site/Bedroom 2.jpg" }, 
      { type: "3 Bedroom", beds: 3, baths: 2.5, sqm: 152, price: 7800000, varietyImg: "/images/getas real estate Sumit 72 site/Bedroom 3.jpg" }, 
      { type: "Villa", beds: 4, baths: 3.5, sqm: 245, price: 11200000, varietyImg: "/images/getas real estate Sumit 72 site/cover.png" }
    ] 
  },
  { 
    id: 3, name: "Enyi Bulbula Heights", location: "Bulbula, Addis Ababa", developer: "Enyi Real Estate", lat: 8.9950, lng: 38.7450, 
    amenities: ["Smart Home Ready", "Underground Parking", "Gym", "Concierge"], 
    units: [
      { type: "Studio", beds: 0, baths: 1, sqm: 42, price: 2450000, varietyImg: "/images/Enyi real estate bulbula site/Bedroom1.jpg" }, 
      { type: "1 Bedroom", beds: 1, baths: 1, sqm: 58, price: 3200000, varietyImg: "/images/Enyi real estate bulbula site/Bedroom 2.jpg" }, 
      { type: "2 Bedroom", beds: 2, baths: 2, sqm: 88, price: 4900000, varietyImg: "/images/Enyi real estate bulbula site/Bedroom 3.jpg" }, 
      { type: "3 Bedroom", beds: 3, baths: 2, sqm: 125, price: 7200000, varietyImg: "/images/Enyi real estate bulbula site/Cover.webp" }
    ] 
  },
  { 
    id: 4, name: "Enyi Jemo Gardens", location: "Jemo, Addis Ababa", developer: "Enyi Real Estate", lat: 9.0080, lng: 38.7200, 
    amenities: ["Landscaped Gardens", "Playground", "24/7 Security", "Parking"], 
    units: [
      { type: "1 Bedroom", beds: 1, baths: 1, sqm: 52, price: 1850000, varietyImg: "/images/Enyi real estate Jemo site/Bedroom1.jpg" }, 
      { type: "2 Bedroom", beds: 2, baths: 2, sqm: 78, price: 2900000, varietyImg: "/images/Enyi real estate Jemo site/Bedroom 2.jpg" }, 
      { type: "3 Bedroom", beds: 3, baths: 2, sqm: 112, price: 4500000, varietyImg: "/images/Enyi real estate Jemo site/Bedroom 3.jpg" }, 
      { type: "Penthouse", beds: 4, baths: 3, sqm: 185, price: 8500000, varietyImg: "/images/Enyi real estate Jemo site/cover.jpg" }
    ] 
  },
  { 
    id: 5, name: "Metro Bulbula Tower", location: "Bulbula, Addis Ababa", developer: "Metro Real Estate", lat: 8.9950, lng: 38.7450, 
    amenities: ["Rooftop Terrace", "Fitness Center", "Sauna", "Business Lounge"], 
    units: [
      { type: "1 Bedroom", beds: 1, baths: 1, sqm: 68, price: 4200000, varietyImg: "/images/Metro real estate bulbula site/Bedroom 1.jpg" }, 
      { type: "2 Bedroom", beds: 2, baths: 2, sqm: 98, price: 6200000, varietyImg: "/images/Metro real estate bulbula site/Bedroom 2.jpg" }, 
      { type: "Penhouse", beds: 4, baths: 3.5, sqm: 310, price: 15800000, varietyImg: "/images/Metro real estate bulbula site/Cover.jpg" }
    ] 
  }
];

export function getProductProgress(name: string): ProgressInfo {
  return productProgress[name] || { progress: 50, status: "under-construction", statusText: "Under Construction", estimated: "TBD" };
}

export function calculateDiscount(price: number, downPercent: number, unitType: string, developer: string) {
  let addDisc = 0;
  if (downPercent >= 100) addDisc = 15;
  else if (downPercent >= 70) addDisc = 10;
  else if (downPercent >= 50) addDisc = 7;
  else if (downPercent >= 30) addDisc = 4;
  else if (downPercent >= 20) addDisc = 2;
  
  if (unitType.includes("Penthouse")) addDisc += 3;
  if (unitType.includes("Villa")) addDisc += 2;
  if (developer === "Getas Real Estate" && price >= 5000000) addDisc += 2;
  
  const total = Math.min(addDisc, 25);
  const discPrice = price * (1 - total / 100);
  
  return { 
    discountPercent: total, 
    discountedPrice: Math.round(discPrice), 
    downPaymentNeeded: Math.round(discPrice * downPercent / 100) 
  };
}

export function getLoanPercentage(dev: string, name: string): string | null {
  if (dev === "Getas Real Estate" && name.includes("Kazanchis")) return "50% Bank Loan";
  if (dev === "Metro Real Estate") return "40% Financing";
  return null;
}
