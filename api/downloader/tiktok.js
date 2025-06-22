const axios = require("axios");

module.exports = {
    name: "TikTok Downloader",
    desc: "Download video TikTok tanpa watermark",
    category: "Downloader",
    params: ["url"],
    async run(req, res) {
        const url = req.query.url;

        if (!url) {
            return res.status(400).json({
                status: false,
                message: "Parameter `url` tidak ditemukan."
            });
        }

        try {
            const response = await axios.get("https://restapi.rizk.my.id/downloader/tiktok", {
                params: { url }
            });

            res.json({
                status: true,
                source: "api.xey.biz.id",
                result: response.data
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: "Gagal mengambil data dari system",
                error: error.response?.data || error.message
            });
        }
    }
};
