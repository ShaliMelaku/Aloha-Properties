/**
 * Global Real Estate Pulse & Reports Service
 * Surfacing high-authority PDF reports and market insights
 */

export interface ExternalReport {
  id: string;
  title: string;
  source: string;
  source_url: string;
  date: string;
  excerpt: string;
  file_url: string;
  category: 'market' | 'policy' | 'investment';
}

export const EXTERNAL_REPORTS: ExternalReport[] = [
  {
    id: 'kf-africa-2024',
    title: 'Africa Report 2024/25: Prime Residential Yields',
    source: 'Knight Frank',
    source_url: 'https://www.knightfrank.com/research/report-library/africa-report-2024-11105.aspx',
    date: '2024-11-20',
    excerpt: 'Comprehensive analysis of prime rents and yields across 30+ African cities, including Addis Ababa residential outlook.',
    file_url: 'https://content.knightfrank.com/research/1110/documents/en/africa-report-2024-11105.pdf',
    category: 'market'
  },
  {
    id: 'af-regulatory-2025',
    title: 'Drafting Growth: The 2025 Real Estate Proclamation',
    source: 'Addis Fortune',
    source_url: 'https://addisfortune.news/',
    date: '2025-01-15',
    excerpt: 'A deep dive into the upcoming regulatory overhaul targeting developer escrow accounts and buyer protection in Ethiopia.',
    file_url: '#', // Usually gated, but link to source provided
    category: 'policy'
  },
  {
    id: 'jll-transparent-2024',
    title: 'Global Real Estate Transparency Index: Ethiopia Pulse',
    source: 'JLL',
    source_url: 'https://www.jll.co.uk/en/trends-and-insights/research/global-real-estate-transparency-index',
    date: '2024-06-12',
    excerpt: 'Tracking the institutionalization of the Ethiopian real estate sector and its progress in transparency metrics.',
    file_url: 'https://www.jll.co.uk/content/dam/jll-com/documents/pdf/research/global/jll-2024-greti-global.pdf',
    category: 'investment'
  }
];

export async function getLiveMarketPulse() {
  // In a production environment, this could fetch from a headless CMS or RSS feed
  return EXTERNAL_REPORTS;
}
