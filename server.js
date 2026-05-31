const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());

app.get('/api/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL) {
        return res.status(400).send("Arey bhai, pehle sahi link toh daal!");
    }

    try {
        console.log(`yt-dlp Extraction Started for: ${videoURL}`);

        // Extracting info safely using yt-dlp
        const info = await youtubedl(videoURL, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
        });

        const title = info.title.replace(/[^\w\s]/gi, ''); 

        res.header('Content-Disposition', `attachment; filename="${title}_Premium.mp4"`);
        res.header('Content-Type', 'video/mp4');

        // Streaming directly with the best format bypassing bot checks
        const stream = youtubedl.exec(videoURL, {
            format: 'best',
            o: '-' // Directs output to stdout instead of saving a file
        });

        stream.stdout.pipe(res);

        console.log('Heavy Duty Download Complete! 🔥');

    } catch (error) {
        console.error("yt-dlp Error:", error.message);
        res.status(500).send("Server mein short circuit ho gaya.");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Dude's Heavy Duty Engine running on port ${PORT} 🚀`);
});