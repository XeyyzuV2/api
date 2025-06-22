const tiktok = require("../lib/scrape_file/tiktok");

module.exports = {
    name: "TikTok Downloader",
    desc: "Scrape video TikTok no watermark via ssstik.io",
    category: "Scraper",
    params: ["url"],

    async run(req, res) {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                creator: "xeyyzuv2",
                message: "Parameter `url` tidak ditemukan"
            });
        }

        try {
            const result = await tiktok.download(url);
            res.json({
                status: true,
                statusCode: 200,
                creator: "xeyyzuv2",
                message: "Berhasil mengambil video",
                result
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                statusCode: 500,
                creator: "xeyyzuv2",
                message: "Gagal mengambil data dari TikTok",
                error: err.message
            });
        }
    }
};
