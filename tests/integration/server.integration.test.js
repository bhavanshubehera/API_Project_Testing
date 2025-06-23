const request = require('supertest');
const app = require('../../server'); // Adjust path if needed

describe('Server Integration Tests', () => {
  test('GET / should return API server running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('API Server is running');
  });

  test('GET /api/tasks should return 200 and an array (empty if no tasks)', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Middleware should parse JSON and CORS should be enabled', async () => {
    const taskData = {
      title: 'Middleware Test',
      description: 'Testing express.json() and CORS',
      completed: false
    };

    const res = await request(app)
      .post('/api/tasks')
      .send(taskData)
      .set('Origin', 'http://example.com') // test CORS
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe(taskData.title);
    expect(res.body.description).toBe(taskData.description);
  });
});
