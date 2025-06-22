const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");

class TikTokScraper {
    async download(url) {
        try {
            const response = await axios.post(
                "https://ssstik.io/abc?url=dl",
                qs.stringify({ id: url, locale: "en" }),
                {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        "user-agent": "Mozilla/5.0"
                    }
                }
            );

            const $ = cheerio.load(response.data);
            const videoLink = $('a[href^="https://"]').attr("href");

            if (!videoLink) throw new Error("Video tidak ditemukan.");

            return {
                status: true,
                video: videoLink
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new TikTokScraper();
