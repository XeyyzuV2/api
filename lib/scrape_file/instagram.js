const axios = require('axios');

async function instagramScraper(url) {
    try {
        // Bersihkan URL dan ambil ID media
        const cleanUrl = url.replace(/[?&].*$/, '');

        // API endpoint untuk mendapatkan data Instagram
        const apiUrl = `https://www.instagram.com/p/${getMediaId(cleanUrl)}/?__a=1`;

        const response = await axios.get(apiUrl, {
            headers: {
                'User -Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const data = response.data;

        if (data.graphql && data.graphql.shortcode_media) {
            const mediaData = data.graphql.shortcode_media;

            return {
                status: true,
                data: {
                    title: mediaData.edge_media_to_caption.edges[0]?.node.text || 'No title',
                    author: {
                        username: mediaData.owner.username || 'Unknown',
                        nickname: mediaData.owner.full_name || 'Unknown',
                        avatar: mediaData.owner.profile_pic_url || null
                    },
                    video: {
                        noWatermark: mediaData.is_video ? mediaData.video_url : null,
                        watermark: null,
                        hd: mediaData.is_video ? mediaData.video_url : null
                    },
                    audio: null,
                    thumbnail: mediaData.thumbnail_src || null,
                    duration: mediaData.is_video ? mediaData.video_duration : 0,
                    stats: {
                        views: mediaData.video_view_count || 0,
                        likes: mediaData.edge_liked_by.count || 0,
                        comments: mediaData.edge_media_to_comment.count || 0,
                        shares: 0 // Instagram tidak menyediakan data share
                    },
                    createTime: mediaData.taken_at_timestamp || null,
                    musicInfo: {
                        title: 'No music info',
                        author: 'Unknown',
                        album: null,
                        url: null
                    }
                }
            };
        } else {
            // Coba metode alternatif jika API pertama gagal
            return await fallbackInstagramScraper(url);
        }

    } catch (error) {
        console.error('Instagram Scraper Error:', error);

        // Coba metode alternatif jika terjadi error
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

async function fallbackInstagramScraper(url) {
    try {
        // Metode alternatif menggunakan API berbeda
        const apiUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;

        const response = await axios.get(apiUrl, {
            headers: {
                'User -Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const data = response.data;

        if (data && data.html) {
            return {
                status: true,
                data: {
                    title: data.title || 'No title',
                    author: {
                        username: data.author_name || 'Unknown',
                        nickname: data.author_name || 'Unknown',
                        avatar: null
                    },
                    video: {
                        noWatermark: null,
                        watermark: null,
                        hd: null
                    },
                    audio: null,
                    thumbnail: data.thumbnail_url || null,
                    duration: 0,
                    stats: {
                        views: 0,
                        likes: 0,
                        comments: 0,
                        shares: 0
                    },
                    createTime: null,
                    musicInfo: {
                        title: 'No music info',
                        author: 'Unknown',
                        album: null,
                        url: null
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
            message: 'Semua metode scraping gagal'
        };
    }
}

function getMediaId(url) {
    const regex = /\/p\/([^\/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Export function utama
module.exports = instagramScraper;
