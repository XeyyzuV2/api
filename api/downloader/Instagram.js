module.exports = {
    name: "Instagram Downloader",
    desc: "Download Instagram posts, reels, stories, and IGTV",
    category: "Downloader",
    params: ["url"],
    async run(req, res) {
        const url = req.query.url;
        
        // Validasi input
        if (!url) {
            return res.json({
                status: false,
                message: "URL Instagram diperlukan"
            });
        }
        
        // Validasi format URL Instagram
        if (!url.includes('instagram.com')) {
            return res.json({
                status: false,
                message: "URL tidak valid. Gunakan URL Instagram yang benar"
            });
        }
        
        try {
            // Langsung panggil scraper yang sudah auto-loaded
            const result = await scrape.instagram(url);
            
            if (result.status) {
                res.json({
                    status: true,
                    message: "Media berhasil diproses",
                    data: result.data
                });
            } else {
                res.json({
                    status: false,
                    message: result.message || "Gagal mengambil data media"
                });
            }
            
        } catch (error) {
            console.error('Instagram Download Error:', error);
            res.json({
                status: false,
                message: "Terjadi kesalahan saat memproses media Instagram"
            });
        }
    }
};

