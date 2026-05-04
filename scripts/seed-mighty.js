const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SHIP_PROPERTIES = [
  {
    name: "Getas Kazanchis Tower",
    developer: "Getas Real Estate",
    location: "Kazanchis, Addis Ababa",
    lat: 9.02, lng: 38.76,
    air_quality_index: 42, urban_heat_index: 2, env_risk_level: "Low",
    discount_percentage: 10, downpayment_percentage: 20,
    payment_schedule: "50% Bank Loan / 50% Milestone",
    amenities: ["Rooftop Restaurant", "Executive Gym", "Smart Elevator"],
    cover_image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80",
    description: "Centrally located luxury tower with breathtaking city views."
  },
  {
    name: "Getas Summit Residence",
    developer: "Getas Real Estate",
    location: "Summit, Addis Ababa",
    lat: 9.00, lng: 38.85,
    air_quality_index: 35, urban_heat_index: 0, env_risk_level: "Low",
    discount_percentage: 15, downpayment_percentage: 30,
    payment_schedule: "Flexible Installments",
    amenities: ["Podium Parking", "Family Park", "CCTV Security"],
    cover_image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80",
    description: "Sustainable family living in the serene Summit district."
  },
  {
    name: "Enyi Bulbula Heights",
    developer: "Enyi Real Estate",
    location: "Bulbula, Addis Ababa",
    lat: 8.98, lng: 38.74,
    air_quality_index: 55, urban_heat_index: 3, env_risk_level: "Moderate",
    discount_percentage: 5, downpayment_percentage: 50,
    payment_schedule: "Cash Preferred",
    amenities: ["Infinity Pool", "Yoga Studio", "Guest Lounge"],
    cover_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80",
    description: "Modern architectural marvel in the rising Bulbula skyline."
  },
  {
    name: "Enyi Jemo Gardens",
    developer: "Enyi Real Estate",
    location: "Jemo, Addis Ababa",
    lat: 8.95, lng: 38.70,
    air_quality_index: 48, urban_heat_index: 1, env_risk_level: "Low",
    discount_percentage: 8, downpayment_percentage: 40,
    payment_schedule: "Custom Milestone Plan",
    amenities: ["Hypermarket", "Clinic", "Pharmacy"],
    cover_image: "https://images.unsplash.com/photo-1448630360428-6e2344731678?auto=format&fit=crop&q=80",
    description: "Integrated community living with primary service nodes."
  },
  {
    name: "Metro Bulbula Tower",
    developer: "Metro Real Estate",
    location: "Bulbula, Addis Ababa",
    lat: 8.97, lng: 38.73,
    air_quality_index: 52, urban_heat_index: 2, env_risk_level: "Low",
    discount_percentage: 12, downpayment_percentage: 25,
    payment_schedule: "40% Financing Available",
    amenities: ["Spa", "Business Center", "Daycare"],
    cover_image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80",
    description: "The crown jewel of Bulbula, offering refined commercial and residential zones."
  },
  {
    name: "The Sovereign",
    developer: "Aloha Developments",
    location: "Bole Atlas, Addis Ababa",
    lat: 9.01, lng: 38.78,
    air_quality_index: 40, urban_heat_index: 1, env_risk_level: "Low",
    discount_percentage: 5, downpayment_percentage: 10,
    payment_schedule: "Bespoke Royal Terms",
    amenities: ["Private Cinema", "Smart Automation", "24/7 Butler"],
    cover_image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80",
    description: "Unparalleled luxury at the heart of Bole Atlas."
  }
];

async function seedMighty() {
  console.log("⚡ Starting 'Mighty' Seeding Protocol...");
  
  // 1. Insert Properties
  const { data: props, error: pErr } = await supabase.from('properties').insert(SHIP_PROPERTIES).select();
  
  if (pErr) {
    console.error("❌ Error seeding properties:", pErr.message);
    return;
  }
  
  console.log(`✅ Seeded ${props.length} flagship properties.`);
  
  // 2. Insert Progress (Sample for each)
  const progressData = props.map(p => ({
    property_id: p.id,
    stage_name: "Under Construction",
    percent: Math.floor(Math.random() * 40) + 40,
    status: 'under-construction',
    status_text: "Targeting Q4 2025 Handover"
  }));
  
  const { error: prErr } = await supabase.from('property_progress').insert(progressData);
  if (prErr) console.warn("⚠️ Warning: Failed to seed progress (Maybe table missing?)", prErr.message);
  else console.log("✅ Seeded construction progress nodes.");

  console.log("🏆 Seeding Successful. Deployment ready for UI restoration.");
}

seedMighty();
