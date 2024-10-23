import { Queue } from 'bullmq';

// Configure the connection to Redis
export const connection = {
  host: process.env.REDISURL, // Redis host (localhost in this case)
  port: parseInt(process.env.REDISPORT, 10), // Redis default port
};

export const inboundMQ = new Queue('inbound-messages', { connection });
export const outboundMQ = new Queue('outbound-messages', { connection });

// Create Dead-Letter Queues (DLQ)
export const inboundDLQ = new Queue('inbound-dlq', { connection });
export const outboundDLQ = new Queue('outbound-dlq', { connection });

export async function addToInboundMQ(message) {
  try {
    // Add a job to the queue
    await inboundMQ.add('forward-inbound-to-DTs', message, {
      attempts: 3, // Retry 3 times on failure
      backoff: { type: 'exponential', delay: 5000 }, // Exponential backoff
    });
    console.log('Message added to queue');
    return true;
  } catch (error) {
    await inboundDLQ.add('failed-inbound', message.data);
    console.error(`Failed to add message to queue: ${error.message}`);
    return false;
  }
}

export async function addToOutboundMQ(message) {
  try {
    // Add a job to the queue
    await outboundMQ.add('forward-inbound-to-DTs', message, {
      attempts: 3, // Retry 3 times on failure
      backoff: { type: 'exponential', delay: 5000 }, // Exponential backoff
    });
    console.log('Message added to queue');
    return true;
  } catch (error) {
    await outboundDLQ.add('failed-outbound', message.data);
    console.error(`Failed to add message to queue: ${error.message}`);
    return false;
  }
}

export default {
  connection,
  inboundMQ,
  outboundMQ,
  inboundDLQ,
  outboundDLQ,
  addToInboundMQ,
  addToOutboundMQ,
};
