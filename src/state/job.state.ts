export interface JobData {
  status: string;
  url?: string;
  error?: string;
}

export const jobs = new Map<string, JobData>();
