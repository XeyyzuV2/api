const axios = require('axios');

async function tiktokScraper(url) {
    try {
        // Bersihkan URL dan ambil video ID
        const cleanUrl = url.replace(/[?&].*$/, '');
        
        // API endpoint untuk mendapatkan data TikTok
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}&hd=1`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const data = response.data;
        
        if (data.code === 0 && data.data) {
            const videoData = data.data;
            
            return {
                status: true,
                data: {
                    title: videoData.title || 'No title',
                    author: {
                        username: videoData.author?.unique_id || 'Unknown',
                        nickname: videoData.author?.nickname || 'Unknown',
                        avatar: videoData.author?.avatar || null
                    },
                    video: {
                        noWatermark: videoData.play || null,
                        watermark: videoData.wmplay || null,
                        hd: videoData.hdplay || null
                    },
                    audio: videoData.music || null,
                    thumbnail: videoData.cover || null,
                    duration: videoData.duration || 0,
                    stats: {
                        views: videoData.play_count || 0,
                        likes: videoData.digg_count || 0,
                        comments: videoData.comment_count || 0,
                        shares: videoData.share_count || 0
                    },
                    createTime: videoData.create_time || null,
                    musicInfo: {
                        title: videoData.music_info?.title || 'No music',
                        author: videoData.music_info?.author || 'Unknown',
                        album: videoData.music_info?.album || null,
                        url: videoData.music_info?.play || null
                    }
                }
            };
        } else {
            // Coba metode alternatif jika API pertama gagal
            return await fallbackTikTokScraper(url);
        }
        
    } catch (error) {
        console.error('TikTok Scraper Error:', error);
        
        // Coba metode alternatif jika terjadi error
        try {
            return await fallbackTikTokScraper(url);
        } catch (fallbackError) {
            return {
                status: false,
                message: 'Gagal mengambil data video TikTok'
            };
        }
    }
}

async function fallbackTikTokScraper(url) {
    try {
        // Metode alternatif menggunakan API berbeda
        const apiUrl = `https://tikdown.org/wp-json/aio-dl/video-data/`;
        
        const response = await axios.post(apiUrl, {
            url: url,
            token: 'aio-dl'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const data = response.data;
        
        if (data.success && data.medias) {
            const videoMedia = data.medias.find(media => media.quality === 'hd' || media.extension === 'mp4');
            const audioMedia = data.medias.find(media => media.extension === 'mp3');
            
            return {
                status: true,
                data: {
                    title: data.title || 'No title',
                    author: {
                        username: data.source || 'Unknown',
                        nickname: data.source || 'Unknown',
                        avatar: null
                    },
                    video: {
                        noWatermark: videoMedia?.url || null,
                        watermark: null,
                        hd: videoMedia?.url || null
                    },
                    audio: audioMedia?.url || null,
                    thumbnail: data.thumbnail || null,
                    duration: data.duration || 0,
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
                        url: audioMedia?.url || null
                    }
                }
            };
        } else {
            throw new Error('Fallback API failed');
        }
        
    } catch (error) {
        console.error('Fallback TikTok Scraper Error:', error);
        return {
            status: false,
            message: 'Semua metode scraping gagal'
        };
    }
}

// Export function utama
module.exports = tiktokScraper;


