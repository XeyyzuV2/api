const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");

module.exports = {
    name: "TikTok Video Downloader",
    desc: "Scrape video TikTok tanpa watermark dari ssstik.io",
    category: "Downloader",
    params: ["url"],

    async run(req, res) {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                creator: "xeyyzuv2",
                message: "Parameter `url` tidak ditemukan."
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
            const result = $('a[href^="https://"]').attr("href");

            if (!result) {
                throw new Error("Link video tidak ditemukan, mungkin diblokir");
            }

            res.json({
                status: true,
                statusCode: 200,
                creator: "xeyyzuv2",
                message: "Berhasil mengambil link video tanpa watermark",
                result
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                statusCode: 500,
                creator: "xeyyzuv2",
                message: "Gagal mengambil data dari system",
                error: err.message
            });
        }
    }
};
