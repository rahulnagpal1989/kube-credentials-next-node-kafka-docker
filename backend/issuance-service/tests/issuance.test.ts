
import request from 'supertest';
import app from '../src/app';

describe('Issuance API', () => {
  it('rejects missing id', async () => {
    const res = await request(app).post('/api/issue').send({ name: 'A' });
    expect(res.status).toBe(400);
  });
  it('issues credential and then reports already issued', async () => {
    const id = `test-${Date.now()}`;
    const payload = { id, name: 'Test' };
    const r1 = await request(app).post('/api/issue').send(payload);
    expect([200,201]).toContain(r1.status);
    const r2 = await request(app).post('/api/issue').send(payload);
    expect(r2.status).toBe(200);
  });
});
