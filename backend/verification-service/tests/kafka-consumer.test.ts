// Mock kafkajs
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockSubscribe = jest.fn().mockResolvedValue(undefined);
const mockRun = jest.fn().mockResolvedValue(undefined);

const mockConsumer = {
  connect: mockConnect,
  subscribe: mockSubscribe,
  run: mockRun
};

const mockKafka = {
  consumer: jest.fn().mockReturnValue(mockConsumer)
};

import { startConsumer } from '../src/kafka-consumer';
import { insertCredential } from '../src/db';


jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => mockKafka)
}));

// Mock the database module
jest.mock('../src/db', () => ({
  insertCredential: jest.fn()
}));

// Mock console methods to avoid noise in test output
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation()
};

describe('Kafka Consumer', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();

    // Reset mock implementations
    mockConnect.mockResolvedValue(undefined);
    mockSubscribe.mockResolvedValue(undefined);
    mockRun.mockResolvedValue(undefined);
    mockKafka.consumer.mockReturnValue(mockConsumer);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('startConsumer', () => {
    it('should connect to Kafka consumer successfully', async () => {
      await startConsumer();

      expect(mockConnect).toHaveBeenCalled();
    });

    it('should subscribe to the correct topic', async () => {
      await startConsumer();

      expect(mockSubscribe).toHaveBeenCalledWith({
        topic: 'credential.issued',
        fromBeginning: true
      });
    });

    it('should start consuming messages', async () => {
      await startConsumer();

      expect(mockRun).toHaveBeenCalledWith({
        eachMessage: expect.any(Function)
      });
    });

    it('should log successful connection message', async () => {
      await startConsumer();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        'Verification service listening to credential.issued...'
      );
    });

    it('should handle connection errors gracefully', async () => {
      const error = new Error('Connection failed');
      mockConnect.mockRejectedValue(error);

      await startConsumer();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        'Failed to connect to Kafka consumer'
      );
    });

    it('should handle subscription errors gracefully', async () => {
      const error = new Error('Subscription failed');
      mockSubscribe.mockRejectedValue(error);

      await startConsumer();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        'Failed to connect to Kafka consumer'
      );
    });

    it('should handle run errors gracefully', async () => {
      const error = new Error('Run failed');
      mockRun.mockRejectedValue(error);

      await startConsumer();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        'Failed to connect to Kafka consumer'
      );
    });
  });

  describe('Message Processing', () => {
    let messageHandler: Function;

    beforeEach(async () => {
      // Start consumer and capture the message handler
      await startConsumer();
      messageHandler = mockRun.mock.calls[0][0].eachMessage;
    });

    it('should process valid credential messages', async () => {
      const testMessage = {
        userid: '123',
        payload: { name: 'abc', email: 'abc@example.com' },
        workerId: 'worker-123',
        timestamp: '2023-01-01T00:00:00Z'
      };

      const mockKafkaMessage = {
        message: {
          value: Buffer.from(JSON.stringify(testMessage))
        }
      };

      await messageHandler(mockKafkaMessage);

      expect(insertCredential).toHaveBeenCalledWith(
        '123',
        JSON.stringify(testMessage.payload),
        'worker-123',
        '2023-01-01T00:00:00Z'
      );
    });

    it('should skip messages with no value', async () => {
      const mockKafkaMessage = {
        message: {
          value: null
        }
      };

      await messageHandler(mockKafkaMessage);

      expect(insertCredential).not.toHaveBeenCalled();
    });

    it('should skip messages with undefined value', async () => {
      const mockKafkaMessage = {
        message: {
          value: undefined
        }
      };

      await messageHandler(mockKafkaMessage);

      expect(insertCredential).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON messages', async () => {
      const mockKafkaMessage = {
        message: {
          value: Buffer.from('invalid json')
        }
      };

      await expect(messageHandler(mockKafkaMessage)).rejects.toThrow();
      expect(insertCredential).not.toHaveBeenCalled();
    });

    it('should handle messages with numeric userid', async () => {
      const testMessage = {
        userid: 123,
        payload: { name: 'abc' },
        workerId: 'worker-123',
        timestamp: '2023-01-01T00:00:00Z'
      };

      const mockKafkaMessage = {
        message: {
          value: Buffer.from(JSON.stringify(testMessage))
        }
      };

      await messageHandler(mockKafkaMessage);

      expect(insertCredential).toHaveBeenCalledWith(
        123,
        JSON.stringify(testMessage.payload),
        'worker-123',
        '2023-01-01T00:00:00Z'
      );
    });

    it('should handle messages with missing optional fields', async () => {
      const testMessage = {
        userid: '123',
        payload: { name: 'abc' }
        // Missing workerId and timestamp
      };

      const mockKafkaMessage = {
        message: {
          value: Buffer.from(JSON.stringify(testMessage))
        }
      };

      await messageHandler(mockKafkaMessage);

      expect(insertCredential).toHaveBeenCalledWith(
        '123',
        JSON.stringify(testMessage.payload),
        undefined,
        undefined
      );
    });

  });

  describe('Integration Scenarios', () => {
    it('should handle multiple messages in sequence', async () => {
      await startConsumer();
      const messageHandler = mockRun.mock.calls[0][0].eachMessage;

      const messages = [
        {
          userid: '1',
          payload: { name: 'User 1' },
          workerId: 'worker-1',
          timestamp: '2023-01-01T00:00:00Z'
        },
        {
          userid: '2',
          payload: { name: 'User 2' },
          workerId: 'worker-2',
          timestamp: '2023-01-01T00:01:00Z'
        }
      ];

      for (const message of messages) {
        const mockKafkaMessage = {
          message: {
            value: Buffer.from(JSON.stringify(message))
          }
        };
        await messageHandler(mockKafkaMessage);
      }

      expect(insertCredential).toHaveBeenCalledTimes(2);
      expect(insertCredential).toHaveBeenNthCalledWith(
        1,
        '1',
        JSON.stringify(messages[0].payload),
        'worker-1',
        '2023-01-01T00:00:00Z'
      );
      expect(insertCredential).toHaveBeenNthCalledWith(
        2,
        '2',
        JSON.stringify(messages[1].payload),
        'worker-2',
        '2023-01-01T00:01:00Z'
      );
    });

    it('should handle mixed valid and invalid messages', async () => {
      await startConsumer();
      const messageHandler = mockRun.mock.calls[0][0].eachMessage;

      // Valid message
      const validMessage = {
        userid: '123',
        payload: { name: 'Valid User' },
        workerId: 'worker-valid',
        timestamp: '2023-01-01T00:00:00Z'
      };

      const validKafkaMessage = {
        message: {
          value: Buffer.from(JSON.stringify(validMessage))
        }
      };

      // Invalid JSON message
      const invalidKafkaMessage = {
        message: {
          value: Buffer.from('invalid json')
        }
      };

      // Process valid message
      await messageHandler(validKafkaMessage);

      // Process invalid message - should throw
      await expect(messageHandler(invalidKafkaMessage)).rejects.toThrow();

      // Only valid message should be processed
      expect(insertCredential).toHaveBeenCalledTimes(1);
      expect(insertCredential).toHaveBeenCalledWith(
        '123',
        JSON.stringify(validMessage.payload),
        'worker-valid',
        '2023-01-01T00:00:00Z'
      );
    });
  });

});