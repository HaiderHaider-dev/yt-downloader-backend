const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// 🧠 Smart Filter: YouTube link se sirf ID nikalne wala function
function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

app.get('/api/extract', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL) {
        return res.status(400).json({ error: "Arey bhai, pehle sahi link toh daal!" });
    }

    const videoId = extractVideoId(videoURL);
    if (!videoId) {
        return res.status(400).json({ error: "Link format theek nahi hai." });
    }

    try {
        console.log(`YTStream API se data aa raha hai ID ke liye: ${videoId}`);

        const options = {
            method: 'GET',
            url: 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl', 
            params: { id: videoId }, // Yahan humne smart ID filter laga diya
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'c9f9a1f885mshbf71d970f126a2fp1db3d1jsna707efbe30a8',
                'X-RapidAPI-Host': 'ytstream-download-youtube-videos.p.rapidapi.com' // Naya Host
            }
        };

        const response = await axios.request(options);
        
        // Jo bhi format data API degi, hum seedha browser ko bhej denge taake tu check kar sake
        res.json(response.data);
        console.log('YTStream Extraction Complete! 🔥');

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: "YTStream se connection toot gaya." });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Dude's YTStream API Proxy running on port ${PORT} 🚀`);
});