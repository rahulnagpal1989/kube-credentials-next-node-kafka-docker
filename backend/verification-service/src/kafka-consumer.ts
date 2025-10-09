import { Kafka } from 'kafkajs';
import { insertCredential } from './db';

const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'credential.issued' });

export async function startConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'credential.issued', fromBeginning: true });
    console.log('Verification service listening to credential.issued...');

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const data = JSON.parse(message.value.toString());
        insertCredential(data.userid, JSON.stringify(data.payload), data.workerId, data.timestamp);
      }
    });
  } catch(err) {
    console.log('Failed to connect to Kafka consumer');
  }
}
