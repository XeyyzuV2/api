const axios = require('axios');

async function instagramScraper(url) {
    try {
        // Bersihkan URL Instagram
        const cleanUrl = url.split('?')[0];
        
        // Method 1: Menggunakan API SaveInsta
        const apiUrl = `https://v3.saveig.app/api/ajaxSearch`;
        
        const response = await axios.post(apiUrl, {
            q: cleanUrl,
            t: 'media',
            lang: 'en'
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        const data = response.data;
        
        if (data.status === 'ok' && data.data) {
            const htmlContent = data.data;
            
            // Parse HTML untuk extract data
            const mediaData = parseInstagramData(htmlContent);
            
            if (mediaData) {
                return {
                    status: true,
                    data: mediaData
                };
            } else {
                // Fallback ke method lain
                return await fallbackInstagramScraper(url);
            }
        } else {
            return await fallbackInstagramScraper(url);
        }
        
    } catch (error) {
        console.error('Instagram Scraper Error:', error);
        
        // Coba method fallback
        try {
            return await fallbackInstagramScraper(url);
        } catch (fallbackError) {
            return {
                status: false,
                message: 'Gagal mengambil data media Instagram'
            };
        }
    }
}

function parseInstagramData(html) {
    try {
        // Extract download links from HTML
        const videoMatch = html.match(/href="([^"]*)" class="[^"]*download-link[^"]*"[^>]*>\s*Download Video/);
        const imageMatch = html.match(/href="([^"]*)" class="[^"]*download-link[^"]*"[^>]*>\s*Download Photo/);
        const thumbnailMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*class="[^"]*result-image/);
        
        // Extract caption/title
        const captionMatch = html.match(/<div[^>]*class="[^"]*result-title[^"]*"[^>]*>([^<]*)/);
        
        let mediaType = 'unknown';
        let mediaUrls = [];
        
        if (videoMatch && videoMatch[1]) {
            mediaType = 'video';
            mediaUrls.push({
                type: 'video',
                url: videoMatch[1],
                quality: 'hd'
            });
        }
        
        if (imageMatch && imageMatch[1]) {
            mediaType = mediaType === 'video' ? 'mixed' : 'image';
            mediaUrls.push({
                type: 'image',
                url: imageMatch[1],
                quality: 'hd'
            });
        }
        
        // Extract multiple media jika carousel
        const allMediaMatches = html.match(/href="([^"]*)" class="[^"]*download-link[^"]*"/g);
        if (allMediaMatches && allMediaMatches.length > 1) {
            mediaType = 'carousel';
            mediaUrls = [];
            
            allMediaMatches.forEach((match, index) => {
                const urlMatch = match.match(/href="([^"]*)"/);
                if (urlMatch && urlMatch[1]) {
                    mediaUrls.push({
                        type: match.includes('Video') ? 'video' : 'image',
                        url: urlMatch[1],
                        quality: 'hd',
                        index: index + 1
                    });
                }
            });
        }
        
        return {
            type: mediaType,
            title: captionMatch && captionMatch[1] ? captionMatch[1].trim() : 'Instagram Media',
            thumbnail: thumbnailMatch && thumbnailMatch[1] ? thumbnailMatch[1] : null,
            mediaUrls: mediaUrls,
            totalMedia: mediaUrls.length
        };
        
    } catch (error) {
        console.error('Parse Instagram Data Error:', error);
        return null;
    }
}

async function fallbackInstagramScraper(url) {
    try {
        // Method 2: Menggunakan API alternatif
        const apiUrl = `https://igram.world/api/ig/post?url=${encodeURIComponent(url)}`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        const data = response.data;
        
        if (data.success && data.data) {
            const mediaData = data.data;
            let mediaUrls = [];
            
            if (mediaData.video_url) {
                mediaUrls.push({
                    type: 'video',
                    url: mediaData.video_url,
                    quality: 'hd'
                });
            }
            
            if (mediaData.image_url) {
                mediaUrls.push({
                    type: 'image',
                    url: mediaData.image_url,
                    quality: 'hd'
                });
            }
            
            // Handle multiple media
            if (mediaData.media && Array.isArray(mediaData.media)) {
                mediaUrls = mediaData.media.map((item, index) => ({
                    type: item.type || 'image',
                    url: item.url,
                    quality: 'hd',
                    index: index + 1
                }));
            }
            
            return {
                status: true,
                data: {
                    type: mediaUrls.length > 1 ? 'carousel' : (mediaUrls[0]?.type || 'image'),
                    title: mediaData.caption || 'Instagram Media',
                    author: {
                        username: mediaData.username || 'Unknown',
                        fullName: mediaData.full_name || 'Unknown',
                        profilePic: mediaData.profile_pic_url || null
                    },
                    thumbnail: mediaData.thumbnail_url || mediaUrls[0]?.url || null,
                    mediaUrls: mediaUrls,
                    totalMedia: mediaUrls.length,
                    stats: {
                        likes: mediaData.like_count || 0,
                        comments: mediaData.comment_count || 0,
                        views: mediaData.view_count || 0
                    }
                }
            };
        } else {
            throw new Error('Fallback API failed');
        }
        
    } catch (error) {
        console.error('Fallback Instagram Scraper Error:', error);
        return {
            status: false,
            message: 'Semua metode scraping Instagram gagal'
        };
    }
}

// Export function utama
module.exports = instagramScraper;
