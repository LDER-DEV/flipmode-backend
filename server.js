import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: './process.env' });
import connectDB from './config/connectDB.js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';


//connecting mongo database
connectDB()
// Set the path for ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    process.env.ORIGIN || 'http://localhost:5173',
    'https://flipmode.netlify.app',
    'chrome-extension://igehpdfdahifdcdnpaiomdfhofddjhie'
  ],
  methods: 'GET,POST',
}));
// Sanitize title for filename
function sanitizeTitle(title) {
  return title.replace(/[<>:"/\\|?*]/g, '').trim().replace(/\s+/g, '_');
}

const port = process.env.PORT ;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get('/api/download', async (req, res) => {
  const url = req.query.url;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send({ error: 'Invalid or missing YouTube URL' });
  }

  try {
    console.log('Processing request for URL:', url);
    const info = await ytdl.getInfo(url);
    const sampleTitle = sanitizeTitle(info.videoDetails.title || 'sample');
    const encodedTitle = encodeURIComponent(sampleTitle);

    res.setHeader('Content-Disposition', `attachment; filename="${encodedTitle}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Video-Title', encodedTitle);
    res.setHeader('Access-Control-Expose-Headers', 'X-Video-Title, Content-Disposition, Content-Type');

    const audioStream = ytdl(url, { filter: 'audioonly' });
    audioStream.on('error', (streamErr) => {
      console.error('Audio stream error:', streamErr);
      res.status(500).send({ error: 'Error streaming audio' });
    });

    ffmpeg(audioStream)
      .audioBitrate(320)
      .toFormat('mp3')
      .on('start', (commandLine) => {
        console.log('FFmpeg started with command:', commandLine);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).send({ error: 'Error converting audio' });
      })
      .on('end', () => {
        console.log('FFmpeg processing finished successfully.');
      })
      .pipe(res, { end: true });
  } catch (error) {
    console.error('Server error:', error.stack || error);
    res.status(500).send({ error: 'An unexpected error occurred' });
  }
});