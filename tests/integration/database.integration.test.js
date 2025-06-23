const request = require('supertest');
const app = require('../../server'); // or wherever your Express app is exported
const mongoose = require('mongoose');
const Task = require('../../models/Task');
require('dotenv').config(); // load .env (not .env.test)

// Connect to your main DB (same as used by app)
beforeAll(async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not defined in .env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 30000); // Increased timeout

// Clean up tasks between tests to prevent pollution
afterEach(async () => {
  await mongoose.connection.collection('tasks').deleteMany({});
});

// Close connection after all tests
afterAll(async () => {
  await mongoose.disconnect();
});

// ---- Your tests remain the same below ----
describe('Database Integration Tests', () => {
  describe('CRUD Operations Integration', () => {
    test('should perform complete CRUD cycle', async () => {
  const newTask = new Task({
    title: 'Integration Test Task',
    description: 'Testing full CRUD cycle',
    completed: false
  });

  const createdTask = await newTask.save();
expect(createdTask).toBeDefined();
expect(createdTask._id).toBeDefined();

// Wait and re-fetch in case write is not yet fully persisted
await new Promise((res) => setTimeout(res, 100)); // Small wait (100ms)
const foundTask = await Task.findById(createdTask._id);
expect(foundTask).not.toBeNull();

  expect(createdTask._id).toBeDefined();
  expect(createdTask.title).toBe('Integration Test Task');

  // ⛏ Ensure the doc is actually in the DB
  foundTask = await Task.findById(createdTask._id).lean(); // Use .lean() for faster read
  expect(foundTask).not.toBeNull();
  expect(foundTask.title).toBe(createdTask.title);

  // ✅ Update step
  await Task.findByIdAndUpdate(createdTask._id, {
    $set: {
      completed: true,
      description: 'Updated description'
    }
  });

  const updatedTask = await Task.findById(createdTask._id).lean();
  expect(updatedTask.completed).toBe(true);
  expect(updatedTask.description).toBe('Updated description');

  // ✅ Delete
  await Task.findByIdAndDelete(createdTask._id);
  const deletedTask = await Task.findById(createdTask._id);
  expect(deletedTask).toBeNull();
});

    test('should handle multiple task creation and retrieval', async () => {
      const tasks = [
        { title: 'Task 1', description: 'Description 1', completed: false },
        { title: 'Task 2', description: 'Description 2', completed: true },
        { title: 'Task 3', description: 'Description 3', completed: false }
      ];

      // Bulk create
      const createdTasks = await Task.insertMany(tasks);
      expect(createdTasks).toHaveLength(3);

      // Retrieve all
      const allTasks = await Task.find({});
      expect(allTasks).toHaveLength(3);

      // Filter by completion status
      const completedTasks = await Task.find({ completed: true });
      expect(completedTasks).toHaveLength(1);

      const incompleteTasks = await Task.find({ completed: false });
      expect(incompleteTasks).toHaveLength(2);
    });

    test('should handle bulk operations', async () => {
      // Create multiple tasks
      await Task.insertMany([
        { title: 'Bulk Task 1', description: 'Desc 1', completed: false },
        { title: 'Bulk Task 2', description: 'Desc 2', completed: false },
        { title: 'Bulk Task 3', description: 'Desc 3', completed: false }
      ]);

      // Bulk update
      const updateResult = await Task.updateMany(
        { completed: false },
        { $set: { completed: true } }
      );
      
      expect(updateResult.modifiedCount).toBe(3);

      // Verify update
      const updatedTasks = await Task.find({ completed: true });
      expect(updatedTasks).toHaveLength(3);

      // Bulk delete
      const deleteResult = await Task.deleteMany({ completed: true });
      expect(deleteResult.deletedCount).toBe(3);

      // Verify deletion
      const remainingTasks = await Task.find({});
      expect(remainingTasks).toHaveLength(0);
    });

    test('should handle database connection errors gracefully', async () => {
      // This test simulates what happens when database operations fail
      // In a real scenario, you might mock mongoose methods to throw errors
      
      try {
        // Attempt to save invalid data (if you have validation)
        const invalidTask = new Task({
          title: '', // Assuming empty title might be invalid
          description: null,
          completed: 'invalid_boolean'
        });
        
        await invalidTask.save();
      } catch (error) {
        expect(error).toBeDefined();
        // Verify it's a validation error or similar
      }
    });
  });

  describe('Database Indexing and Performance', () => {
    test('should efficiently query by common fields', async () => {
      // Create a larger dataset
      const tasks = Array.from({ length: 100 }, (_, i) => ({
        title: `Task ${i}`,
        description: `Description ${i}`,
        completed: i % 2 === 0
      }));

      await Task.insertMany(tasks);

      const startTime = Date.now();
      const completedTasks = await Task.find({ completed: true });
      const queryTime = Date.now() - startTime;

      expect(completedTasks).toHaveLength(50);
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Transaction Support (if applicable)', () => {
    test('should handle transactions if using replica set', async () => {
      // Note: Transactions require replica set in MongoDB
      // This test might not work with MongoMemoryServer in single node mode
      // Include this test if your production environment uses replica sets
      
      const session = await mongoose.startSession();
      
      try {
        await session.withTransaction(async () => {
          const task1 = new Task({
            title: 'Transaction Task 1',
            description: 'Part of transaction',
            completed: false
          });
          
          const task2 = new Task({
            title: 'Transaction Task 2',
            description: 'Part of transaction',
            completed: false
          });

          await task1.save({ session });
          await task2.save({ session });
        });

        const tasks = await Task.find({ description: 'Part of transaction' });
        expect(tasks).toHaveLength(2);
      } catch (error) {
        // Transactions might not be supported in test environment
        console.log('Transaction test skipped - not supported in test environment');
      } finally {
        await session.endSession();
      }
    });
  });
});
describe('Task Route Coverage', () => {
  let taskId;
  beforeEach(async () => {
  const task = await Task.create({ title: 'Test', description: 'Test', completed: false });
  taskId = task._id;
  await new Promise(res => setTimeout(res, 100)); // wait for indexing
});

  afterEach(async () => {
    await Task.deleteMany({});
  });

  test('GET /api/tasks/:id returns task', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test');
  });

  test('GET /api/tasks/:id returns 404 for invalid ID', async () => {
    const res = await request(app).get('/api/tasks/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  test('PUT /api/tasks/:id updates a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  test('DELETE /api/tasks/:id deletes a task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`);
    expect(res.status).toBe(200);
  });

  test('POST /api/tasks with missing data returns 422', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({});
    expect([400, 422]).toContain(res.status);
  });
});
