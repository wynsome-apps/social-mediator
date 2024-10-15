// src/services/worker-setup.js
import { Worker } from 'bullmq';
import { connection, inboundDLQ, outboundDLQ } from './messagequeue.service.js';
import { sendToDiscipleTools } from './discipletools.service.js';
import facebookService from './facebook.service.js';

console.log('Creating worker');
const inboundWorker = new Worker(
  'inbound-messages',
  async (job) => {
    const result = await sendToDiscipleTools(job.data);
    if (result.status != 200) throw new Error('Failed to forward message');
  },
  { connection }
);

const outboundWorker = new Worker(
  'outbound-messages',
  async (job) => {
    const result = await facebookService.sendToFacebook(job.data);
    if (result.status != 200) throw new Error('Failed to forward message');
  },
  { connection }
);

inboundWorker.on('completed', async (job) => {
  console.log(`Job ${job.id} has completed!`);
  try {
    await job.remove();
    console.log(`Job ${job.id} has been removed from the queue`);
    // Check and remove the job from the DLQ if it exists
    const dlqJob = await inboundDLQ.getJob(`DLQ_${job.id}`);
    if (dlqJob) {
      await dlqJob.remove();
      console.log(`Job ${job.id} has been removed from the DLQ`);
    }
  } catch (error) {
    console.error(`Failed to remove job ${job.id}: ${error.message}`);
  }
});

inboundWorker.on('failed', async (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);

  // Check if the job already exists in the DLQ
  const dlqJob = await inboundDLQ.getJob(job.id);
  if (!dlqJob) {
    await inboundDLQ.add('failed-inbound', job.data, {
      jobId: `DLQ_${job.id}`,
    });
    console.log(`Job ${job.id} has been added to the DLQ`);
  }
});

outboundWorker.on('completed', async (job) => {
  console.log(`Job ${job.id} has completed!`);
  try {
    await job.remove();
    console.log(`Job ${job.id} has been removed from the outbound queue`);
    // Check and remove the job from the DLQ if it exists
    const dlqJob = await outboundDLQ.getJob(`DLQ_${job.id}`);
    if (dlqJob) {
      await dlqJob.remove();
      console.log(`Job ${job.id} has been removed from the outbound DLQ`);
    }
  } catch (error) {
    console.error(`Failed to remove job ${job.id}: ${error.message}`);
  }
});

export default {
  inboundWorker,
  outboundWorker,
};
