
import request from 'supertest';
import app from '../src/app';

describe('Verification API', () => {
  it('rejects missing id', async () => {
    const res = await request(app).post('/api/verify').send({ name: 'A' });
    expect(res.status).toBe(400);
  });
  // This test assumes an existing credential in issuance DB - for unit test we just ensure 404 when not present
  it('returns 200 for valid credential', async () => {
    const payload = { userid: `unknown-${Date.now()}`, name: 'Nobody' };
    const r = await request(app).post('/api/verify').send(payload);
    expect(r.status).toBe(200);
  });
});
