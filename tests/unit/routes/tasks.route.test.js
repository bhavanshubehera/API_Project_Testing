// tests/unit/routes/tasks.route.test.js
const request = require('supertest');
const express = require('express');
const Task = require('../../../models/Task'); // mocked
const taskRoutes = require('../../../routes/tasks');

// Create app and mount route
const app = express();
app.use(express.json());
app.use('/api', taskRoutes);

// Mock the Task model
jest.mock('../../../models/Task');

describe('Task Routes Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/tasks - should create a task', async () => {
    const mockTask = { title: 'Unit Test Task', description: 'desc', completed: false };
    Task.mockImplementation(() => ({ save: () => Promise.resolve(mockTask) }));

    const res = await request(app)
      .post('/api/tasks')
      .send(mockTask);

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Unit Test Task');
    expect(Task).toHaveBeenCalledWith(mockTask);
  });

  test('GET /api/tasks - should return tasks', async () => {
    Task.find.mockResolvedValue([{ title: 'Task 1' }, { title: 'Task 2' }]);

    const res = await request(app).get('/api/tasks');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(Task.find).toHaveBeenCalled();
  });

test('PUT /api/tasks/:id - should update a task', async () => {
  const validId = '507f1f77bcf86cd799439011';
  const updatedTask = { _id: validId, title: 'Updated', completed: true };

  Task.findByIdAndUpdate.mockResolvedValue(updatedTask);

  const res = await request(app)
    .put(`/api/tasks/${validId}`)
    .send({ title: 'Updated', completed: true });

  expect(res.statusCode).toBe(200);
  expect(res.body.title).toBe('Updated');
  expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
    validId,
    { title: 'Updated', completed: true },
    { new: true, runValidators: true } // ✅ Fixed here
  );
});



test('DELETE /api/tasks/:id - should delete a task', async () => {
  const validId = '507f1f77bcf86cd799439011';

  Task.findByIdAndDelete.mockResolvedValue({ _id: validId });

  const res = await request(app).delete(`/api/tasks/${validId}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('Task deleted');
  expect(Task.findByIdAndDelete).toHaveBeenCalledWith(validId);
});

});
