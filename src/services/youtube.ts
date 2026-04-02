import fs from 'fs';
import path from 'path';
import ytdlExec from 'yt-dlp-exec';
import { TEMP_DIR } from '../constants';

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export const youtubeService = {
  /**
   * Fetch video specifics (title, auto-generated thumnail/id)
   * And download highest quality `.mp4`
   */
  async processVideo(url: string, jobId: string) {
    console.log(`[Job ${jobId}] starting yt-dlp download for ${url}...`);

    const outputTemplate = path.join(TEMP_DIR, `${jobId}.%(ext)s`);

    // Using yt-dlp to download directly for best compat, explicitly request mp4 format
    await ytdlExec(url, {
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      output: outputTemplate,
      mergeOutputFormat: 'mp4',
      writeThumbnail: true, // Saves thumbnail automatically
      dumpJson: true, // Print video details to stdout as JSON
    });

    const infoRaw = await ytdlExec(url, {
      dumpJson: true,
      noWarnings: true,
    });

    // Parse out video basics
    let title = 'Unknown Title';
    let expectedId = jobId;
    try {
      if (typeof infoRaw === 'string') {
        const info = JSON.parse(infoRaw);
        title = info.title || title;
        expectedId = info.id || expectedId;
      } else {
        title = (infoRaw as any).title || title;
        expectedId = (infoRaw as any).id || expectedId;
      }
    } catch (e) {}

    const dlVideoPath = path.join(TEMP_DIR, `${jobId}.mp4`);
    const dlThumbPath = path.join(TEMP_DIR, `${jobId}.webp`); // usually yt-dlp downloads thumbnail as webp or jpg

    return { title, originalId: expectedId, videoPath: dlVideoPath, thumbnailPath: dlThumbPath };
  },

  cleanup(jobId: string) {
    const files = fs.readdirSync(TEMP_DIR);
    for (const file of files) {
      if (file.startsWith(jobId)) {
        fs.unlinkSync(path.join(TEMP_DIR, file));
      }
    }
  },
};
