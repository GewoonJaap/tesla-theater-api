import { Context } from 'hono';
import { randomUUID } from 'crypto';
import { jobs } from '../state/job.state';
import { processVideoPipeline } from '../services/videoPipeline.service';
import { cloudflareService } from '../services/cloudflare';

export const startVideoProcessing = async (c: Context) => {
  const body = await c.req.json();
  if (!body.url) return c.json({ error: 'Please provide a YouTube URL' }, 400);

  const jobId = randomUUID();
  jobs.set(jobId, { status: 'queued' });

  // Start background process pipeline without blocking the request
  processVideoPipeline(body.url, jobId);

  return c.json({ jobId, message: 'Processing started in the background.' }, 202);
};

export const getVideoStatus = (c: Context) => {
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing ID' }, 400);

  const job = jobs.get(id);
  if (!job) return c.json({ error: 'Job not found' }, 404);
  return c.json(job);
};

export const getAllVideos = async (c: Context) => {
  try {
    const records = await cloudflareService.getAllVideos();
    return c.json({ videos: records });
  } catch (error: any) {
    return c.json(
      { error: 'Failed to fetch videos from Cloudflare D1', detail: error.message },
      500,
    );
  }
};
