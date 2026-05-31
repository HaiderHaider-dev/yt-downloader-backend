const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// Naya endpoint jo UI ko sari qualities ke links bhejega
app.get('/api/extract', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL) {
        return res.status(400).json({ error: "Arey bhai, pehle sahi link toh daal!" });
    }

    try {
        console.log(`Extracting data via RapidAPI for: ${videoURL}`);

        // Yeh ek standard RapidAPI configuration hai. 
        // Tujhe RapidAPI par "Youtube Video Download" API subscribe karni hogi (Free wali)
        const options = {
            method: 'GET',
            url: 'https://youtube-video-download-info.p.rapidapi.com/dl', 
            params: { url: videoURL },
            headers: {
                // Tera key jo tune .env mein banaya tha
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'c9f9a1f885mshbf71d970f126a2fp1db3d1jsna707efbe30a8',
                'X-RapidAPI-Host': 'youtube-video-download-info.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        const data = response.data;

        // Frontend ke in premium buttons ke liye data structure kar rahe hain
        const result = {
            title: data.title || "Premium_Video",
            thumbnail: data.thumb || "",
            links: {
                supreme_1080p: data.link['1080p'] ? data.link['1080p'][0] : null,
                hd_720p: data.link['720p'] ? data.link['720p'][0] : null,
                standard_360p: data.link['360p'] ? data.link['360p'][0] : null,
                audio_mp3: data.link['mp3'] ? data.link['mp3'][0] : null
            }
        };

        // UI ko JSON bhej do taake buttons mein link lag jayein
        res.json(result);
        console.log('Extraction Complete! 🔥');

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: "API connection fail ho gayi. RapidAPI dashboard check kar!" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Dude's God-Mode API Proxy running on port ${PORT} 🚀`);
});