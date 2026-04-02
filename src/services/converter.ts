import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { TEMP_DIR } from '../constants';

export const converterService = {
  /**
   * Convert an MP4 to .ogv using libTheora and libvorbis
   * Required for Tesla Theater API to display as `.ogv` format.
   */
  async convertToOgv(inputFilePath: string, jobId: string): Promise<string> {
    const outputFilePath = path.join(TEMP_DIR, `${jobId}.ogv`);

    return new Promise((resolve, reject) => {
      console.log(
        `[Job ${jobId}] Starting ffmpeg conversion: ${inputFilePath} -> ${outputFilePath}`,
      );

      ffmpeg(inputFilePath)
        // Set codecs specifically for Theora/Vorbis (OGV)
        .videoCodec('libtheora')
        .audioCodec('libvorbis')
        .outputOptions([
          '-qscale:v 7', // reasonable variable quality slider for Theora
          '-qscale:a 5', // audio quality
        ])
        .on('end', () => {
          console.log(`[Job ${jobId}] Conversion finished successfully.`);
          resolve(outputFilePath);
        })
        .on('error', (err) => {
          console.error(`[Job ${jobId}] Conversion error:`, err);
          reject(err);
        })
        .save(outputFilePath);
    });
  },
};
