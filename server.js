import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';
import dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

dotenv.config();

// Set the path for ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:5173',
  methods: 'GET,POST',
}));

// Sanitize title for filename
function sanitizeTitle(title) {
  return title.replace(/[<>:"/\\|?*]/g, '').trim().replace(/\s+/g, '_');
}

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
    const sampleTitle = sanitizeTitle(info.videoDetails.title || 'sample');
    const encodedTitle = encodeURIComponent(sampleTitle);

    res.setHeader('Content-Disposition', `attachment; filename="${encodedTitle}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    const audioStream = ytdl(url, { filter: 'audioonly' });

    ffmpeg(audioStream)
      .audioBitrate(128)
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