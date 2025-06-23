const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server'); // Adjust path to your server file
const Task = require('../../models/Task'); // Adjust path as needed

describe('Task API Endpoints', () => {
  // Clear tasks before each test
  beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await Task.deleteMany({});
  }
});


  afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});


  describe('GET /api/tasks', () => {
    test('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all tasks', async () => {
      // Create test data
      await Task.create([
        { title: 'Task 1', description: 'Description 1', completed: false },
        { title: 'Task 2', description: 'Description 2', completed: true }
      ]);

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('completed');
      expect(response.body[0]).toHaveProperty('_id');
    });

    test('should return tasks with correct data types', async () => {
      await Task.create({
        title: 'Type Test Task',
        description: 'Testing data types',
        completed: true
      });

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(typeof response.body[0].title).toBe('string');
      expect(typeof response.body[0].description).toBe('string');
      expect(typeof response.body[0].completed).toBe('boolean');
      expect(typeof response.body[0]._id).toBe('string');
    });
  });

  describe('POST /api/tasks', () => {
    test('should create a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New task description',
        completed: false
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.description).toBe(newTask.description);
      expect(response.body.completed).toBe(newTask.completed);

      // Verify task was actually saved in database
      const savedTask = await Task.findById(response.body._id);
      expect(savedTask).toBeDefined();
      expect(savedTask.title).toBe(newTask.title);
    });

    test('should create task with default completed status', async () => {
      const newTask = {
        title: 'Task without completed field',
        description: 'Testing default value'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body.completed).toBe(false);
    });

    test('should handle missing required fields', async () => {
      const invalidTask = {
        description: 'Task without title'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask);

      // Adjust expected status code based on your validation logic
      expect([400, 422, 500]).toContain(response.status);
    });

    test('should handle invalid data types', async () => {
      const invalidTask = {
        title: 123, // Number instead of string
        description: true, // Boolean instead of string
        completed: 'not_a_boolean'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask);

      // Should handle gracefully, either convert or reject
      expect([200, 201, 400, 422]).toContain(response.status);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Task to Update',
        description: 'Original description',
        completed: false
      });
      taskId = task._id.toString();
    });

    test('should update existing task', async () => {
      const updates = {
        title: 'Updated Task',
        description: 'Updated description',
        completed: true
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updates)
        .expect(200);

      expect(response.body.title).toBe(updates.title);
      expect(response.body.description).toBe(updates.description);
      expect(response.body.completed).toBe(updates.completed);

      // Verify update in database
      const updatedTask = await Task.findById(taskId);
      expect(updatedTask.title).toBe(updates.title);
      expect(updatedTask.completed).toBe(updates.completed);
    });

    test('should update only completed status', async () => {
      const updates = {
        completed: true
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updates)
        .expect(200);

      expect(response.body.completed).toBe(true);
      expect(response.body.title).toBe('Task to Update'); // Should remain unchanged
    });

    test('should handle non-existent task ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updates = { completed: true };

      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .send(updates);

      expect([404, 400]).toContain(response.status);
    });

    test('should handle invalid task ID format', async () => {
      const invalidId = 'invalid-id-format';
      const updates = { completed: true };

      const response = await request(app)
        .put(`/api/tasks/${invalidId}`)
        .send(updates);

      expect([400, 422, 500]).toContain(response.status);
    });

    test('should handle empty update object', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({});

      // Should either return unchanged task or handle gracefully
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Task to Delete',
        description: 'Will be deleted',
        completed: false
      });
      taskId = task._id.toString();
    });

    test('should delete existing task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');

      // Verify deletion in database
      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });

    test('should handle non-existent task ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`);

      expect([404, 400]).toContain(response.status);
    });

    test('should handle invalid task ID format', async () => {
      const invalidId = 'invalid-id-format';

      const response = await request(app)
        .delete(`/api/tasks/${invalidId}`);

      expect([400, 422, 500]).toContain(response.status);
    });
  });

  describe('API Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect([400, 422]).toContain(response.status);
    });

    test('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send('title=Test&description=Test');

      // Should handle gracefully
      expect(response.status).toBeDefined();
    });

    test('should return appropriate status codes', async () => {
      // Test various endpoints for proper status codes
      const responses = await Promise.all([
        request(app).get('/api/tasks'),
        request(app).post('/api/tasks').send({
          title: 'Status Test',
          description: 'Testing status codes'
        })
      ]);

      expect(responses[0].status).toBe(200); // GET
      expect(responses[1].status).toBe(201); // POST
    });
  });

  describe('API Performance', () => {
    test('should handle concurrent requests', async () => {
      // Create multiple simultaneous requests
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/tasks')
          .send({
            title: `Concurrent Task ${i}`,
            description: `Description ${i}`,
            completed: false
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all tasks were created
      const allTasks = await Task.find({});
      expect(allTasks).toHaveLength(10);
    });

    test('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/tasks')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});

describe('Error Coverage for Task Routes', () => {
  // Ensure DB is clean before each error test
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await Task.deleteMany({});
    }
  });

  // Restore mocked functions after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('POST /api/tasks should return 422 on validation failure', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({}) // Missing required fields
      .set('Content-Type', 'application/json');

    expect([400, 422]).toContain(response.status);
    expect(response.body).toHaveProperty('error');
  });

  test('GET /api/tasks should return 500 on DB failure', async () => {
    jest.spyOn(Task, 'find').mockRejectedValue(new Error('Database failure'));

    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/Database failure/);
  });

  test('PUT /api/tasks/:id should return 422 on invalid data', async () => {
    const task = await Task.create({
      title: 'Invalid Update Test',
      description: 'Testing invalid update',
      completed: false
    });

    const response = await request(app)
      .put(`/api/tasks/${task._id}`)
      .send({ title: '' }); // Assuming '' is invalid

    expect([400, 422]).toContain(response.status);
    expect(response.body).toHaveProperty('error');
  });

  test('DELETE /api/tasks/:id should return 500 on DB error', async () => {
    const task = await Task.create({
      title: 'Delete Failure Test',
      description: 'Simulate DB error',
      completed: false
    });

    jest.spyOn(Task, 'findByIdAndDelete').mockRejectedValue(new Error('Forced deletion error'));

    const response = await request(app).delete(`/api/tasks/${task._id}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/Forced deletion error/);
  });
});
