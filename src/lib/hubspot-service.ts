/**
 * HubSpot CRM Integration Service
 * Syncs Aloha Properties leads to HubSpot Contacts
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  message?: string;
}

export async function syncToHubSpot(lead: LeadData) {
  if (!HUBSPOT_ACCESS_TOKEN) {
    console.warn("HubSpot Integration skipped: Missing HUBSPOT_ACCESS_TOKEN environment variable.");
    return null;
  }

  try {
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        properties: {
          firstname: lead.name.split(" ")[0],
          lastname: lead.name.split(" ").slice(1).join(" ") || "Prospect",
          email: lead.email,
          phone: lead.phone,
          message: lead.message,
          hs_content_membership_notes: `Interest: ${lead.interest || "General"}`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HubSpot API Error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("HubSpot Synchronization failed:", error);
    return null;
  }
}
