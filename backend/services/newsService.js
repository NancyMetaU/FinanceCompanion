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
        limit: 20,
        sort_by: "published_desc",
      },
    });
    return response.data.data;
  } catch (err) {
    console.error("Error fetching news from Marketaux:", err);x
  }
}

module.exports = {
  fetchNews,
};
