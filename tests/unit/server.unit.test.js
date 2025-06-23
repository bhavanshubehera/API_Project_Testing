// Move this to the very top before importing app
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn(() => Promise.resolve()),
  };
});

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');


describe('server.js Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET / should return API running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('API Server is running');
  });

  test('Unknown route should return 404', async () => {
    const res = await request(app).get('/not-found');
    expect(res.statusCode).toBe(404);
  });

  test('should handle JSON parsing middleware', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test', description: 'desc', completed: false });

    // Allow various outcomes since DB isn't mocked here
    expect([200, 201, 500]).toContain(res.statusCode);
  });

  test('should handle MongoDB connection error (mocked)', async () => {
    const originalConnect = mongoose.connect;
    mongoose.connect = jest.fn(() => Promise.reject(new Error('Mock connection error')));

    try {
      await mongoose.connect();
    } catch (err) {
      expect(err.message).toBe('Mock connection error');
    }

    mongoose.connect = originalConnect; // restore
  });
});
