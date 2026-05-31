const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());

// The Clean API Endpoint
app.get('/api/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send("Arey bhai, pehle sahi link toh daal!");
    }

    try {
        // 🔥 NAYA HACK: Exact Chrome Headers bina kisi Cookie (Agent) ke!
        const requestOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        };

        const info = await ytdl.getInfo(videoURL, { requestOptions });
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); 

        res.header('Content-Disposition', `attachment; filename="${title}_1080p.mp4"`);
        res.header('Content-Type', 'video/mp4');

        console.log(`Downloading started for: ${title}`);

        // Streams ko direct flexible filter de diya
        const videoStream = ytdl(videoURL, { filter: 'videoonly', quality: 'highestvideo', requestOptions });
        const audioStream = ytdl(videoURL, { filter: 'audioonly', quality: 'highestaudio', requestOptions });

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
    console.log(`Dude's Clean Downloader Engine running on port ${PORT} 🚀`);
});