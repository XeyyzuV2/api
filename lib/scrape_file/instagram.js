const axios = require('axios');
const cheerio = require('cheerio');

async function instagramScraper(url) {
    try {
        // Bersihkan URL
        const cleanUrl = sanitizeUrl(url);
        if (!cleanUrl) return { status: false, message: "URL tidak valid" };

        // ================= METODE 1: Gunakan API Publik =================
        try {
            const apiResult = await axios.get('https://www.instagramsave.com/download', { 
                params: { url: cleanUrl },
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            if (apiResult.data?.media) {
                return formatSuccessResponse(apiResult.data.media);
            }
        } catch (apiError) {
            console.log('Metode API gagal, mencoba alternatif...');
        }

        // ================= METODE 2: Scrape HTML Langsung =================
        try {
            const { data: html } = await axios.get(cleanUrl, {
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
                }
            });

            const $ = cheerio.load(html);
            const videoSrc = $('meta[property="og:video"]').attr('content');
            const imageSrc = $('meta[property="og:image"]').attr('content');

            if (videoSrc || imageSrc) {
                return {
                    status: true,
                    data: {
                        type: videoSrc ? 'video' : 'image',
                        url: videoSrc || imageSrc,
                        thumbnail: imageSrc || null,
                        title: $('title').text() || 'Instagram Media'
                    }
                };
            }
        } catch (htmlError) {
            console.log('Metode HTML gagal', htmlError);
        }

        // ================= METODE 3: Gunakan API Alternatif =================
        const fallback = await fallbackApiMethod(cleanUrl);
        if (fallback.status) return fallback;

        return { status: false, message: "Semua metode gagal" };

    } catch (error) {
        console.error('Error utama:', error);
        return { status: false, message: "Kesalahan sistem" };
    }
}

// Helper Functions
function sanitizeUrl(url) {
    const regex = /https?:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[a-zA-Z0-9_-]+/;
    const match = url.match(regex);
    return match ? match[0] : null;
}

function formatSuccessResponse(media) {
    return {
        status: true,
        data: {
            type: media.type,
            url: media.url,
            thumbnail: media.thumbnail,
            title: media.title || 'Instagram Media',
            duration: media.duration || 0,
            author: {
                username: media.author?.username || 'Unknown',
                avatar: media.author?.avatar || null
            }
        }
    };
}

async function fallbackApiMethod(url) {
    try {
        const res = await axios.post('https://api.igram.io/v1/download', { 
            url 
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.data.success) {
            return formatSuccessResponse(res.data.media);
        }
    } catch {
        return { status: false };
    }
}

module.exports = instagramScraper;
