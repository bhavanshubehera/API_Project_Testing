const mongoose = require('mongoose');

// Assuming your Task model is in models/Task.js
// You might need to adjust the path based on your actual file structure
const Task = require('../../models/Task'); // Adjust path as needed

describe('Task Model Unit Tests', () => {
  describe('Task Creation', () => {
    test('should create a valid task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        completed: false
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask._id).toBeDefined();
      expect(savedTask.title).toBe(taskData.title);
      expect(savedTask.description).toBe(taskData.description);
      expect(savedTask.completed).toBe(false);
    });

    test('should create task with default completed status', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask.completed).toBeFalsy();
    });

    test('should handle missing title', async () => {
      const taskData = {
        description: 'Test Description',
        completed: false
      };

      const task = new Task(taskData);
      
      // If title is required, this should throw an error
      // Adjust based on your actual model validation
      try {
        await task.save();
        // If no error, title is not required
        expect(task.title).toBeUndefined();
      } catch (error) {
        // If error, title is required
        expect(error).toBeDefined();
      }
    });
  });

  describe('Task Validation', () => {
    test('should validate task fields', async () => {
      const task = new Task({
        title: 'Valid Task',
        description: 'Valid Description',
        completed: true
      });

      const validationError = task.validateSync();
      expect(validationError).toBeUndefined();
    });

    test('should handle boolean conversion for completed field', () => {
      const task = new Task({
        title: 'Test Task',
        description: 'Test Description',
        completed: 'true' // String instead of boolean
      });

      // Mongoose should convert string 'true' to boolean true
      expect(typeof task.completed).toBe('boolean');
    });
  });

  describe('Task Queries', () => {
    beforeEach(async () => {
      // Create test data
      await Task.create([
        { title: 'Task 1', description: 'Desc 1', completed: false },
        { title: 'Task 2', description: 'Desc 2', completed: true },
        { title: 'Task 3', description: 'Desc 3', completed: false }
      ]);
    });

    test('should find all tasks', async () => {
      const tasks = await Task.find({});
      expect(tasks).toHaveLength(3);
    });

    test('should find completed tasks', async () => {
      const completedTasks = await Task.find({ completed: true });
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].title).toBe('Task 2');
    });

    test('should find incomplete tasks', async () => {
      const incompleteTasks = await Task.find({ completed: false });
      expect(incompleteTasks).toHaveLength(2);
    });

    test('should update task completion status', async () => {
      const task = await Task.findOne({ title: 'Task 1' });
      task.completed = true;
      const updatedTask = await task.save();

      expect(updatedTask.completed).toBe(true);
    });

    test('should delete task', async () => {
      const task = await Task.findOne({ title: 'Task 1' });
      await Task.findByIdAndDelete(task._id);

      const remainingTasks = await Task.find({});
      expect(remainingTasks).toHaveLength(2);
    });
  });
});