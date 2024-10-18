import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';
import ffmpeg from 'fluent-ffmpeg';  // Install with `npm install fluent-ffmpeg`
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:5173',
  methods: 'GET,POST',
}));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/api/download', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send({ error: 'No URL provided' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const sampleTitle = info.videoDetails.title || 'sample';

    const sanitizedTitle = encodeURIComponent(sampleTitle.replace(/[<>:"/\\|?*]/g, '').trim());

    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    // Use FFmpeg to convert the stream to MP3 format
    const audioStream = ytdl(url, { filter: 'audioonly' });

    ffmpeg(audioStream)
      .audioBitrate(128) // You can adjust the bitrate if needed
      .toFormat('mp3')
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).send({ error: 'Error converting audio' });
      })
      .pipe(res, { end: true });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: error.message || 'An error occurred' });
  }
});