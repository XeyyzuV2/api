const axios = require('axios');
const cheerio = require('cheerio');

async function instagramScraper(url) {
    try {
        // 1. Check URL validity
        const xeycleanUrl = sanitizeInstagramUrl(url);
        if (!xeycleanUrl) {
            return { 
                status: false,
                message: "URL Instagram tidak valid" 
            };
        }

        // 2. First Method - Use public API
        const apiResult = await tryInstagramApi(xeycleanUrl);
        if (apiResult.status) return apiResult;

        // 3. Second Method - Parse HTML directly
        const htmlResult = await parseInstagramHtml(xeycleanUrl);
        if (htmlResult.status) return htmlResult;

        // 4. If all methods fail
        return {
            status: false,
            message: "Gagal mengambil konten Instagram"
        };

    } catch (error) {
        console.error('Scraper Error:', error);
        return {
            status: false,
            message: "Internal server error"
        };
    }
}

// Helper functions
function sanitizeInstagramUrl(url) {
    try {
        const pattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|stories)\/[a-zA-Z0-9_-]+/;
        const match = url.match(pattern);
        return match ? match[0] : null;
    } catch {
        return null;
    }
}

async function tryInstagramApi(url) {
    try {
        const response = await axios.get(`https://www.instagramsave.com/api`, {
            params: { url },
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        const data = response.data;
        if (data.downloadUrl) {
            return {
                status: true,
                data: {
                    type: data.type || 'single',
                    urls: [data.downloadUrl],
                    caption: data.caption || ''
                }
            };
        }
        return { status: false };
    } catch {
        return { status: false };
    }
}

async function parseInstagramHtml(url) {
    try {
        const mobileUrl = url.replace('www.', 'm.');
        const response = await axios.get(mobileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            }
        });
        
        const $ = cheerio.load(response.data);
        const videoUrl = $('meta[property="og:video"]').attr('content');
        const imageUrl = $('meta[property="og:image"]').attr('content');
        const caption = $('title').text();

        if (videoUrl || imageUrl) {
            return {
                status: true,
                data: {
                    type: videoUrl ? 'video' : 'image',
                    urls: [videoUrl || imageUrl],
                    caption: caption || ''
                }
            };
        }
        return { status: false };
    } catch {
        return { status: false };
    }
}

module.exports = instagramScraper;
