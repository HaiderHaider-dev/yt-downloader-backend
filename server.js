const express = require('express');
const cors = require('cors');
const play = require('play-dl');

const app = express();
app.use(cors());

// The Stealth API Endpoint
app.get('/api/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL) {
        return res.status(400).send("Arey bhai, pehle sahi link toh daal!");
    }

    try {
        console.log(`Stealth Extraction Started for: ${videoURL}`);

        // play-dl bypasses bot checks to get real video info
        const info = await play.video_info(videoURL);
        const title = info.video_details.title.replace(/[^\w\s]/gi, ''); 

        res.header('Content-Disposition', `attachment; filename="${title}_Premium.mp4"`);
        res.header('Content-Type', 'video/mp4');

        // Fetching the unblockable stream (usually 720p with merged audio directly!)
        const stream = await play.stream(videoURL, { 
            discordPlayerCompatibility: true 
        });

        // Piping direct to browser
        stream.stream.pipe(res);

        console.log('Stealth Download Complete! 🔥');

    } catch (error) {
        console.error("Engine Error:", error.message);
        res.status(500).send("Server mein short circuit ho gaya.");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Dude's Stealth Engine running on port ${PORT} 🚀`);
});