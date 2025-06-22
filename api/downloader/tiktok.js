const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");

module.exports = {
    name: "TikTok Scraper",
    desc: "Scrape video TikTok tanpa watermark dari ssstik.io",
    category: "Scraper",
    params: ["url"],
    
    async run(req, res) {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({
                status: false,
                message: "Parameter `url` wajib diisi"
            });
        }

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
            const videoUrl = $('a[href^="https://"]').attr("href");

            if (!videoUrl) throw new Error("Gagal ambil video");

            res.json({
                status: true,
                message: "Sukses scrape dari ssstik.io",
                video_url: videoUrl
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                message: "Scraping gagal",
                error: err.message
            });
        }
    }
};
