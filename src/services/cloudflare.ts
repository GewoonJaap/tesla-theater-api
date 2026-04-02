import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Cloudflare from 'cloudflare';
import fs from 'fs';
import path from 'path';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const CLOUDFLARE_R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const CLOUDFLARE_R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const CLOUDFLARE_D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || '';

// S3 Client configuration for R2
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// Cloudflare API Object for D1
const cf = new Cloudflare({
  apiToken: CLOUDFLARE_API_TOKEN,
});

export const cloudflareService = {
  /**
   * Upload video and thumbnail files to Cloudflare R2
   */
  async uploadFile(filePath: string, s3Key: string, contentType: string) {
    const fileStream = fs.createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: CLOUDFLARE_R2_BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: contentType,
    });

    try {
      await s3.send(command);
      console.log(`Successfully uploaded ${s3Key} to R2.`);
      return `https://${CLOUDFLARE_R2_BUCKET_NAME}.<YOUR_PUBLIC_R2_DOMAIN>/${s3Key}`; // Map this properly for frontend use
    } catch (error) {
      console.error('Error uploading file to R2', error);
      throw error;
    }
  },

  /**
   * Insert video metadata into Cloudflare D1
   */
  async insertVideoRecord(videoId: string, title: string, videoUrl: string, thumbnailUrl: string) {
    const query = `INSERT INTO videos (id, title, video_url, thumbnail_url, created_at)
                   VALUES (?, ?, ?, ?, ?)`;

    try {
      await cf.d1.database.query(CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_ACCOUNT_ID, {
        sql: query,
        params: [videoId, title, videoUrl, thumbnailUrl, new Date().toISOString()],
      });
      console.log('Successfully saved to D1 DB.');
    } catch (error) {
      console.error('Error saving to Cloudflare D1', error);
      throw error;
    }
  },

  /**
   * Retrieve all previously processed videos
   */
  async getAllVideos() {
    const query = `SELECT * FROM videos ORDER BY created_at DESC`;
    try {
      const resp = await cf.d1.database.query(CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_ACCOUNT_ID, {
        sql: query,
      });
      return resp.result?.[0]?.results || [];
    } catch (error) {
      console.error('Error fetching videos from Cloudflare D1', error);
      throw error;
    }
  },
};
