const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const API_URL = "https://api.marketaux.com/v1/news/all";

async function fetchNews() {
  try {
    const response = await axios.get(API_URL, {
      params: {
        api_token: process.env.MARKETAUX_API_KEY,
        language: "en",
        countries: "us",
        filter_entities: true,
        page: 1,
        limit: 10,
        sort_by: "published_desc",
      },
    });
    return response.data.data;
  } catch (err) {
    console.error("Error fetching news from Marketaux:", err);
    throw err;
  }
}

module.exports = {
  fetchNews,
};
