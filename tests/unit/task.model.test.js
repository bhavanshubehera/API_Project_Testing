const mongoose = require('mongoose');
const Task = require('../../models/Task');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterEach(async () => {
  await Task.deleteMany(); // clean up between tests
});

afterAll(async () => {
  // Only drop DB if connected
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('Task Model Unit Tests', () => {
  describe('Task Creation', () => {
    test('should create a valid task', async () => {
      const task = new Task({ title: 'Test', description: 'Desc', completed: false });
      const saved = await task.save();

      expect(saved._id).toBeDefined();
      expect(saved.title).toBe('Test');
      expect(saved.description).toBe('Desc');
      expect(saved.completed).toBe(false);
    });

    test('should create task with default completed status', async () => {
      const task = new Task({ title: 'Task', description: 'No status' });
      const saved = await task.save();

      expect(saved.completed).toBe(false);
    });

    test('should handle missing title', async () => {
      const task = new Task({ description: 'Missing title' });

      await expect(task.save()).rejects.toThrow(); // title is required
    });
  });

  describe('Task Validation', () => {
    test('should validate correct task', () => {
      const task = new Task({ title: 'Valid', description: 'OK', completed: true });
      expect(task.validateSync()).toBeUndefined();
    });

    test('should coerce string "true" to boolean true', () => {
      const task = new Task({ title: 'Coerce', description: 'yes', completed: 'true' });
      expect(task.completed).toBe(true);
    });
  });

  describe('Task Queries', () => {
    beforeEach(async () => {
      await Task.insertMany([
        { title: 'Task 1', description: 'Desc 1', completed: false },
        { title: 'Task 2', description: 'Desc 2', completed: true },
        { title: 'Task 3', description: 'Desc 3', completed: false }
      ]);
    });

    test('should find all tasks', async () => {
      const tasks = await Task.find();
      expect(tasks).toHaveLength(3);
    });

    test('should find completed tasks', async () => {
      const tasks = await Task.find({ completed: true });
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task 2');
    });

    test('should find incomplete tasks', async () => {
      const tasks = await Task.find({ completed: false });
      expect(tasks).toHaveLength(2);
    });

    test('should update task', async () => {
      const task = await Task.findOne({ title: 'Task 1' });
      task.completed = true;
      const updated = await task.save();

      expect(updated.completed).toBe(true);
    });

    test('should delete a task', async () => {
      const task = await Task.findOne({ title: 'Task 1' });
      await Task.findByIdAndDelete(task._id);

      const remaining = await Task.find();
      expect(remaining).toHaveLength(2);
    });
  });
});
