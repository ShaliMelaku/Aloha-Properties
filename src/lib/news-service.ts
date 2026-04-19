export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  type: 'article' | 'report' | 'guide'; // New categorization
}

export async function fetchEthiopiaRealEstateNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn("NEWS_API_KEY is not defined. Returning empty news array.");
    return [];
  }

  const keywords = '"Ethiopia" AND ("real estate" OR property OR investment OR finance)';
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&max=5&apikey=${apiKey}`;

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`News API Failed (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  const articles = data.articles || [];

  // Categorize articles intelligently
  return articles.map((art: Omit<NewsArticle, 'type'>) => {
    const text = (art.title + " " + art.description).toLowerCase();
    let type: 'article' | 'report' | 'guide' = 'article';

    if (text.includes("report") || text.includes("stats") || text.includes("market") || text.includes("data") || text.includes("annual")) {
      type = 'report';
    } else if (text.includes("how to") || text.includes("guide") || text.includes("tips") || text.includes("regulation") || text.includes("policy")) {
      type = 'guide';
    }

    return { ...art, type };
  });
}

