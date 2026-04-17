require('dotenv').config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.NEWS_API_KEY;
  const keywords = "Ethiopia (real estate OR finance OR economy OR investment OR regulation)";
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&country=et&max=10&apikey=${apiKey}`;
  
  console.log("Fetching:", url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (e) {
    console.error(e);
  }
}
test();
