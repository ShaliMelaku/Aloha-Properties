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

  const keywords = "Ethiopia (real estate OR finance OR economy OR investment OR regulation)";
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&country=et&max=10&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`);
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
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

