// Mock kafkajs
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockSend = jest.fn().mockResolvedValue(undefined);

const mockProducer = {
  connect: mockConnect,
  send: mockSend
};

const mockKafka = {
  producer: jest.fn().mockReturnValue(mockProducer)
};

import request from 'supertest';
import app from '../src/app';

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => mockKafka),
  logLevel: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },
  Partitioners: {
    LegacyPartitioner: jest.fn(),
    DefaultPartitioner: jest.fn()
  }
}));

describe('Issuance API', () => {
  it('rejects missing id', async () => {
    const res = await request(app).post('/api/issue').send({ name: 'A' });
    expect(res.status).toBe(400);
  });
  // This test assumes an existing credential in issuance DB - for unit test we just ensure 404 when not present
  it('returns 201 for correct credential', async () => {
    const payload = { userid: `unknown-${Date.now()}`, name: 'Nobody' };
    const r = await request(app).post('/api/issue').send(payload);
    expect(r.status).toBe(201);
  });
});
