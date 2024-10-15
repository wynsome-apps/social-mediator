// src/services/list-jobs.js
import { Queue } from 'bullmq';

const connection = {
  host: '127.0.0.1',
  port: 6379,
};

async function listJobs() {
  const queue = new Queue('inbound-dlq', { connection });

  try {
    const jobs = await queue.getJobs([
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
    ]);
    jobs.forEach((job) => {
      console.log(
        `Job ID: ${job.id}, Status: ${job.status}, Data: ${JSON.stringify(job.data)}`
      );
    });
  } catch (error) {
    console.error('Error listing jobs:', error);
  }
}

listJobs();
