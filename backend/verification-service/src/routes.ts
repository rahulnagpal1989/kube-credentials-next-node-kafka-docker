
import { Router } from 'express';
import { findCredential } from './db';
import os from 'os';

const router = Router();
const workerId = process.env.WORKER_ID || os.hostname();

router.post('/verify', async (req, res) => {
  try {
    const credential = req.body;
    if (!credential || !credential.userid) return res.status(400).json({ error: 'credential with unique userid is required' });
    const existing = await findCredential(credential.userid);
    //console.log('existing:', existing, credential);
    if (!existing) return res.status(200).json({ message: 'Credential not found' });
    return res.status(200).json({ workerId: existing.workerId || workerId, timestamp: existing.timestamp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});
export default router;
