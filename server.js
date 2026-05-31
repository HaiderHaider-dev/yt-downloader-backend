const express = require('express');
const cors = require('cors');
const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// FFmpeg ka path
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());

// 🔥 THE MAGIC MASK: Cookie Agent Setup 🔥
let agent;
try {
    const cookieData = JSON.parse(fs.readFileSync('./cookies.json'));
    agent = ytdl.createAgent(cookieData);
    console.log("Awwwards-Level Cookie Agent Loaded! 🍪");
} catch (error) {
    console.log("Warning: cookies.json nahi mila! Server bina mask ke jayega.");
}

// The Ultimate Downloader API Endpoint
app.get('/api/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send("Arey bhai, pehle sahi link toh daal!");
    }

    try {
        // Agent ko requests ke sath pass kar rahe hain taake 429 bypass ho
        const info = await ytdl.getInfo(videoURL, { agent });
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); 

        res.header('Content-Disposition', `attachment; filename="${title}_1080p.mp4"`);
        res.header('Content-Type', 'video/mp4');

        console.log(`Downloading started for: ${title}`);

        // Streams mein bhi agent laga diya
        const videoStream = ytdl(videoURL, { quality: 'highestvideo', agent });
        const audioStream = ytdl(videoURL, { quality: 'highestaudio', agent });

        ffmpeg()
            .input(videoStream)
            .input(audioStream)
            .outputFormat('mp4')
            .outputOptions('-c:v copy')
            .outputOptions('-c:a aac')
            .outputOptions('-movflags frag_keyframe+empty_moov') 
            .outputOptions('-strict experimental')
            .on('error', (err) => {
                console.error('Merge mein masla aa gaya:', err.message);
                if (!res.headersSent) res.status(500).send("Processing failed.");
            })
            .on('end', () => {
                console.log('Premium Download Complete! 🔥');
            })
            .pipe(res, { end: true });

    } catch (error) {
        console.error("YTDL Error:", error.message);
        res.status(500).send("Server mein short circuit ho gaya.");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Dude's Downloader Engine running on port ${PORT} 🚀`);
});