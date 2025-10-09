
import { Router } from 'express';
import { findCredential, insertCredential } from './db';
import os from 'os';
import { Kafka, Partitioners } from 'kafkajs';

const router = Router();
const workerId = process.env.WORKER_ID || os.hostname();
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

// Connect with retry logic
(async () => {
  try {
    await producer.connect();
    console.log('Connected to Kafka');
  } catch (err) {
    console.log('Failed to connect to Kafka', err);
  }
})();

router.post('/issue', async (req, res) => {
  try {
    const credential = req.body;
    if (!credential || !credential.userid) return res.status(400).json({ error: 'credential with unique userid is required' });
    const existing = await findCredential(credential.userid);
    //console.log('existing:', existing, credential);
    if (existing && existing.workerId) {
      return res.status(200).json({ userid: existing.userid, workerId: existing.workerId, timestamp: existing.timestamp, message: `Credential already issued by ${existing.workerId}` });
    }

    const ts = new Date().toISOString();
    await insertCredential(credential.userid, JSON.stringify(credential), workerId, ts);

    // Publish event to Kafka
    try {
      await producer.send({
        topic: 'credential.issued',
        messages: [{ value: JSON.stringify({ userid: credential.userid, payload: credential, workerId, timestamp: ts }) }]
      });
    } catch (kafkaErr) {
      console.error('Failed to send message to Kafka:', kafkaErr);
      // Continue without failing the request
    }

    res.status(201).json({ userid: credential.userid, workerId, timestamp: ts, message: `Credential issued by ${workerId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});
export default router;
