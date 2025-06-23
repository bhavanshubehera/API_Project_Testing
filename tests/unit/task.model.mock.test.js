const mongoose = require('mongoose');

// Mock the Task model
jest.mock('../../models/Task', () => {
  return {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    insertMany: jest.fn()
  };
});

const Task = require('../../models/Task');

describe('Task Model Unit Tests with Mocking', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Task Creation with Mocking', () => {
    test('should create a task successfully', async () => {
      const taskData = {
        title: 'Mocked Task',
        description: 'Mocked Description',
        completed: false
      };

      const mockCreatedTask = {
        _id: '507f1f77bcf86cd799439011',
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      Task.create.mockResolvedValue(mockCreatedTask);

      const result = await Task.create(taskData);

      expect(Task.create).toHaveBeenCalledWith(taskData);
      expect(Task.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreatedTask);
    });

    test('should handle task creation failure', async () => {
      const taskData = {
        title: 'Failed Task',
        description: 'This will fail',
        completed: false
      };

      const mockError = new Error('Database connection failed');
      Task.create.mockRejectedValue(mockError);

      await expect(Task.create(taskData)).rejects.toThrow('Database connection failed');
      expect(Task.create).toHaveBeenCalledWith(taskData);
    });
  });

  describe('Task Retrieval with Mocking', () => {
    test('should find all tasks', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', description: 'Desc 1', completed: false },
        { _id: '2', title: 'Task 2', description: 'Desc 2', completed: true }
      ];

      Task.find.mockResolvedValue(mockTasks);

      const result = await Task.find({});

      expect(Task.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(2);
    });

    test('should find task by ID', async () => {
      const mockTask = { 
        _id: '507f1f77bcf86cd799439011', 
        title: 'Found Task', 
        description: 'Found Description', 
        completed: false 
      };

      Task.findById.mockResolvedValue(mockTask);

      const result = await Task.findById('507f1f77bcf86cd799439011');

      expect(Task.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockTask);
    });

    test('should return null for non-existent task', async () => {
      Task.findById.mockResolvedValue(null);

      const result = await Task.findById('nonexistent-id');

      expect(result).toBeNull();
    });

    test('should filter tasks by completion status', async () => {
      const mockCompletedTasks = [
        { _id: '1', title: 'Completed Task', description: 'Done', completed: true }
      ];

      Task.find.mockResolvedValue(mockCompletedTasks);

      const result = await Task.find({ completed: true });

      expect(Task.find).toHaveBeenCalledWith({ completed: true });
      expect(result).toEqual(mockCompletedTasks);
    });
  });

  describe('Task Updates with Mocking', () => {
    test('should update task by ID', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      const updates = { completed: true };
      const mockUpdatedTask = {
        _id: taskId,
        title: 'Updated Task',
        description: 'Updated Description',
        completed: true
      };

      Task.findByIdAndUpdate.mockResolvedValue(mockUpdatedTask);

      const result = await Task.findByIdAndUpdate(taskId, updates, { new: true });

      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(taskId, updates, { new: true });
      expect(result).toEqual(mockUpdatedTask);
    });

    test('should handle update failure', async () => {
      const taskId = 'invalid-id';
      const updates = { completed: true };

      Task.findByIdAndUpdate.mockRejectedValue(new Error('Invalid ID format'));

      await expect(Task.findByIdAndUpdate(taskId, updates, { new: true }))
        .rejects.toThrow('Invalid ID format');
    });

    test('should perform bulk updates', async () => {
      const filter = { completed: false };
      const update = { $set: { completed: true } };
      const mockResult = { modifiedCount: 5, matchedCount: 5 };

      Task.updateMany.mockResolvedValue(mockResult);

      const result = await Task.updateMany(filter, update);

      expect(Task.updateMany).toHaveBeenCalledWith(filter, update);
      expect(result.modifiedCount).toBe(5);
    });
  });

  describe('Task Deletion with Mocking', () => {
    test('should delete task by ID', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      const mockDeletedTask = {
        _id: taskId,
        title: 'Deleted Task',
        description: 'This was deleted',
        completed: false
      };

      Task.findByIdAndDelete.mockResolvedValue(mockDeletedTask);

      const result = await Task.findByIdAndDelete(taskId);

      expect(Task.findByIdAndDelete).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockDeletedTask);
    });

    test('should return null when deleting non-existent task', async () => {
      Task.findByIdAndDelete.mockResolvedValue(null);

      const result = await Task.findByIdAndDelete('nonexistent-id');

      expect(result).toBeNull();
    });

    test('should perform bulk deletion', async () => {
      const filter = { completed: true };
      const mockResult = { deletedCount: 3 };

      Task.deleteMany.mockResolvedValue(mockResult);

      const result = await Task.deleteMany(filter);

      expect(Task.deleteMany).toHaveBeenCalledWith(filter);
      expect(result.deletedCount).toBe(3);
    });
  });

  describe('Bulk Operations with Mocking', () => {
    test('should insert multiple tasks', async () => {
      const tasksData = [
        { title: 'Bulk Task 1', description: 'Desc 1', completed: false },
        { title: 'Bulk Task 2', description: 'Desc 2', completed: false }
      ];

      const mockInsertedTasks = tasksData.map((task, index) => ({
        _id: `id-${index}`,
        ...task
      }));

      Task.insertMany.mockResolvedValue(mockInsertedTasks);

      const result = await Task.insertMany(tasksData);

      expect(Task.insertMany).toHaveBeenCalledWith(tasksData);
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockInsertedTasks);
    });

    test('should handle bulk insert failure', async () => {
      const tasksData = [
        { title: 'Invalid Task', description: null, completed: 'invalid' }
      ];

      Task.insertMany.mockRejectedValue(new Error('Validation failed'));

      await expect(Task.insertMany(tasksData)).rejects.toThrow('Validation failed');
    });
  });

  describe('Edge Cases with Mocking', () => {
    test('should handle database connection errors', async () => {
      const connectionError = new Error('Connection timeout');
      Task.find.mockRejectedValue(connectionError);

      await expect(Task.find({})).rejects.toThrow('Connection timeout');
    });

    test('should handle malformed queries', async () => {
      const malformedQuery = { $invalid: 'query' };
      Task.find.mockRejectedValue(new Error('Invalid query operator'));

      await expect(Task.find(malformedQuery)).rejects.toThrow('Invalid query operator');
    });

    test('should verify mock call counts and arguments', async () => {
      const taskData = { title: 'Test', description: 'Test', completed: false };
      
      Task.create.mockResolvedValue({ _id: 'test-id', ...taskData });
      Task.find.mockResolvedValue([]);
      Task.findById.mockResolvedValue(null);

      await Task.create(taskData);
      await Task.find({});
      await Task.findById('test-id');

      expect(Task.create).toHaveBeenCalledTimes(1);
      expect(Task.find).toHaveBeenCalledTimes(1);
      expect(Task.findById).toHaveBeenCalledTimes(1);
    });
  });
});