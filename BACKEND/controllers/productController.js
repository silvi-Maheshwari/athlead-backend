const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeProduct(req, res) {
  const { url } = req.body;

  
  if (!url || !/^https?:\/\/(www\.)?amazon\.in\/.*$/.test(url)) {
    return res.status(400).json({ error: 'Invalid Amazon URL' });
  }

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(response.data);

    
    const getText = (selector) => $(selector).text().trim() || 'Not Available';

    const productName = getText('#productTitle');
    const rating = getText('span.a-icon-alt');
    const numRatings = getText('#acrCustomerReviewText');
    // const price = getText('span.a-price > span.a-offscreen');
    const discount = getText('span.savingsPercentage');

   
    const bankOffers = [];
    $('div#ppd-bank-offers_feature_div li').each((_, el) => {
      bankOffers.push($(el).text().trim());
    });


    const aboutThisItem = [];
    $('div#feature-bullets li').each((_, el) => {
      aboutThisItem.push($(el).text().trim());
    });

    
    const images = [];
    $('img').each((_, el) => {
      const imgSrc = $(el).attr('src');
      if (imgSrc && imgSrc.includes('amazon') && !imgSrc.includes('.gif')) images.push(imgSrc);
    });

   
    res.json({
      productName,
      rating,
      numRatings,
      // price,
      discount,
      bankOffers: bankOffers.length ? bankOffers : ['No Bank Offers Available'],
      aboutThisItem: aboutThisItem.length ? aboutThisItem : ['No Information Available'],
      images: images.length ? images : ['No Images Available']
    });
  } catch (error) {
    console.error('Scraping Error:', error.message);
    res.status(500).json({ error: 'Failed to scrape product data. Please try again later.' });
  }
}

module.exports = { scrapeProduct };