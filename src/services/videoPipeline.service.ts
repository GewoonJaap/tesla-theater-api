import { jobs } from '../state/job.state';
import { youtubeService } from './youtube';
import { converterService } from './converter';
import { cloudflareService } from './cloudflare';

export const processVideoPipeline = async (url: string, jobId: string) => {
  try {
    jobs.set(jobId, { status: 'downloading_youtube' });
    // 1. Fetch info and download (yt-dlp)
    const ytResult = await youtubeService.processVideo(url, jobId);

    jobs.set(jobId, { status: 'converting_ogv' });
    // 2. Convert to `.ogv` (ffmpeg)
    const ogvPath = await converterService.convertToOgv(ytResult.videoPath, jobId);

    jobs.set(jobId, { status: 'uploading_video' });
    // 3. Upload `.ogv` to R2
    const ogvUrl = await cloudflareService.uploadFile(ogvPath, `${jobId}.ogv`, 'video/ogg');

    jobs.set(jobId, { status: 'uploading_thumbnail' });
    // 4. Upload `.webp`/`.jpg` thumbnail
    const thumbUrl = await cloudflareService.uploadFile(
      ytResult.thumbnailPath,
      `${jobId}-thumb.webp`,
      'image/webp',
    ); // Assuming webp default

    jobs.set(jobId, { status: 'saving_d1_record' });
    // 5. Store record in Cloudflare D1
    await cloudflareService.insertVideoRecord(
      ytResult.originalId,
      ytResult.title,
      ogvUrl,
      thumbUrl,
    );

    // 6. Cleanup local temp files
    youtubeService.cleanup(jobId);

    jobs.set(jobId, { status: 'done', url: ogvUrl });
  } catch (e: any) {
    console.error(`Job ${jobId} Failed:`, e);
    jobs.set(jobId, { status: 'error', error: e.message || 'Unknown error' });
    youtubeService.cleanup(jobId);
  }
};
