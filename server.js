const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// FFmpeg ka path set kar diya taake server ko pata ho engine kahan hai
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());

// The Ultimate Downloader API Endpoint
app.get('/api/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send("Arey bhai, pehle sahi link toh daal!");
    }

    try {
        // Video ki basic info utha rahe hain title ke liye
        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Special characters hata diye

        // Browser ko bata rahe hain ke yeh video file hai aur download karni hai
        res.header('Content-Disposition', `attachment; filename="${title}_1080p.mp4"`);
        res.header('Content-Type', 'video/mp4');

        console.log(`Downloading started for: ${title}`);

        // 1. Sirf High-Res Video utha (No Audio)
        const videoStream = ytdl(videoURL, { quality: 'highestvideo' });
        
        // 2. Sirf Highest Quality Audio utha
        const audioStream = ytdl(videoURL, { quality: 'highestaudio' });

        // 3. FFmpeg ka Jadoo (Dono ko merge kar raha hai)
        ffmpeg()
            .input(videoStream)
            .input(audioStream)
            // Output format set kar raha hai
            .outputFormat('mp4')
            // Dono streams ko bina re-encoding ke jor raha hai
            .outputOptions('-c:v copy')
            .outputOptions('-c:a aac')
            // 🔥 THE MAGIC FIX: Fragmented MP4 for live HTTP Streaming 🔥
            .outputOptions('-movflags frag_keyframe+empty_moov') 
            .outputOptions('-strict experimental')
            // Errors handle karna
            .on('error', (err) => {
                console.error('Merge mein masla aa gaya:', err.message);
                if (!res.headersSent) res.status(500).send("Processing failed.");
            })
            .on('end', () => {
                console.log('Premium Download Complete! 🔥');
            })
            // Direct browser ki stream mein pipe kar diya
            .pipe(res, { end: true });

    } catch (error) {
        console.error("YTDL Error:", error);
        res.status(500).send("Server mein short circuit ho gaya.");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Dude's Downloader Engine running on port ${PORT} 🚀`);
});