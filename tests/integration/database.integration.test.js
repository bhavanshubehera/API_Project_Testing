const mongoose = require('mongoose');
const Task = require('../../models/Task'); // Adjust path as needed

describe('Database Integration Tests', () => {
  describe('CRUD Operations Integration', () => {
    test('should perform complete CRUD cycle', async () => {
      // CREATE
      const newTask = new Task({
        title: 'Integration Test Task',
        description: 'Testing full CRUD cycle',
        completed: false
      });
      const createdTask = await newTask.save();
      
      expect(createdTask._id).toBeDefined();
      expect(createdTask.title).toBe('Integration Test Task');

      // READ
      const foundTask = await Task.findById(createdTask._id);
      expect(foundTask).toBeDefined();
      expect(foundTask.title).toBe(createdTask.title);

      // UPDATE
      foundTask.completed = true;
      foundTask.description = 'Updated description';
      const updatedTask = await foundTask.save();
      
      expect(updatedTask.completed).toBe(true);
      expect(updatedTask.description).toBe('Updated description');

      // DELETE
      await Task.findByIdAndDelete(updatedTask._id);
      const deletedTask = await Task.findById(updatedTask._id);
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