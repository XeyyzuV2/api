module.exports = {
    name: "TikTok Downloader",
    desc: "Download TikTok videos without watermark",
    category: "Downloader",
    params: ["url"],
    async run(req, res) {
        const url = req.query.url;
        
        // Validasi input
        if (!url) {
            return res.json({
                status: false,
                message: "URL TikTok diperlukan"
            });
        }
        
        // Validasi format URL TikTok
        if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com')) {
            return res.json({
                status: false,
                message: "URL tidak valid. Gunakan URL TikTok yang benar"
            });
        }
        
        try {
            // Langsung panggil scraper yang sudah auto-loaded
            const result = await scrape.tiktok(url);
            
            res.json({
                status: true,
                message: "Video berhasil diproses",
                data: result
            });
            
        } catch (error) {
            console.error('TikTok Download Error:', error);
            res.json({
                status: false,
                message: "Terjadi kesalahan saat memproses video"
            });
        }
    }
};
