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



export const productProgress: Record<string, ProgressInfo> = {
  "Getas Kazanchis Tower": { progress: 68, status: "under-construction", statusText: "Under Construction", estimated: "Q4 2025" },
  "Getas Summit Residence": { progress: 72, status: "under-construction", statusText: "Under Construction", estimated: "Q1 2026" },
  "Enyi Bulbula Heights": { progress: 85, status: "nearing-completion", statusText: "Nearing Completion", estimated: "Q2 2025" },
  "Enyi Jemo Gardens": { progress: 55, status: "under-construction", statusText: "Under Construction", estimated: "Q3 2026" },
  "Metro Bulbula Tower": { progress: 78, status: "under-construction", statusText: "Under Construction", estimated: "Q4 2025" }
};

export const properties: Property[] = [
  { 
    id: 1, name: "The Sovereign", location: "Bole Atlas, Addis Ababa", developer: "Aloha Developments", lat: 9.01, lng: 38.78, 
    amenities: ["Rooftop Infinity Pool", "Private Cinema", "Smart Automation", "24/7 Security"], 
    units: [
      { type: "Studio", beds: 0, baths: 1, sqm: 48, price: 4500000, varietyImg: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80" }, 
      { type: "Penthouse", beds: 4, baths: 4.5, sqm: 320, price: 32000000, varietyImg: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80" }
    ] 
  },
  { 
    id: 2, name: "Empire Heights", location: "Kazanchis, Addis Ababa", developer: "Aloha Developments", lat: 9.02, lng: 38.76, 
    amenities: ["Executive Lounge", "Fitness Center", "High-speed Elevators", "Concierge"], 
    units: [
      { type: "1 Bedroom", beds: 1, baths: 1, sqm: 75, price: 8200000, varietyImg: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80" }, 
      { type: "2 Bedroom", beds: 2, baths: 2, sqm: 110, price: 12500000, varietyImg: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80" }
    ] 
  },
  { 
    id: 3, name: "Skyline Residences", location: "Bole Medhanialem", developer: "Aloha Premium", lat: 9.00, lng: 38.79, 
    amenities: ["Spa & Wellness Centre", "Children's Play Area", "Podium Parking"], 
    units: [
      { type: "2 Bedroom", beds: 2, baths: 2, sqm: 125, price: 15800000, varietyImg: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80" }, 
      { type: "3 Bedroom", beds: 3, baths: 3, sqm: 185, price: 21000000, varietyImg: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80" }
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
