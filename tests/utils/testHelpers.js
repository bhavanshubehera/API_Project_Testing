const mongoose = require('mongoose');
const Task = require('../../models/Task'); // Adjust path as needed

/**
 * Test helper utilities for creating test data and common operations
 */

/**
 * Create a single test task
 * @param {Object} taskData - Task data to create
 * @returns {Promise<Object>} Created task
 */
const createTestTask = async (taskData = {}) => {
  const defaultTask = {
    title: 'Test Task',
    description: 'Test Description',
    completed: false
  };

  const mergedTask = { ...defaultTask, ...taskData };
  return await Task.create(mergedTask);
};

/**
 * Create multiple test tasks
 * @param {number} count - Number of tasks to create
 * @param {Object} baseData - Base data for tasks
 * @returns {Promise<Array>} Array of created tasks
 */
const createMultipleTestTasks = async (count = 3, baseData = {}) => {
  const tasks = Array.from({ length: count }, (_, index) => ({
    title: `Test Task ${index + 1}`,
    description: `Test Description ${index + 1}`,
    completed: index % 2 === 0, // Alternate completion status
    ...baseData
  }));

  return await Task.insertMany(tasks);
};

/**
 * Generate valid MongoDB ObjectId
 * @returns {string} Valid ObjectId string
 */
const generateValidObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

/**
 * Generate invalid ObjectId for testing error cases
 * @returns {string} Invalid ObjectId string
 */
const generateInvalidObjectId = () => {
  return 'invalid-object-id';
};

/**
 * Create task data with all fields
 * @param {Object} overrides - Fields to override
 * @returns {Object} Complete task object
 */
const createCompleteTaskData = (overrides = {}) => {
  return {
    title: 'Complete Test Task',
    description: 'Complete test description with all fields',
    completed: false,
    ...overrides
  };
};

/**
 * Create minimal task data
 * @param {Object} overrides - Fields to override
 * @returns {Object} Minimal task object
 */
const createMinimalTaskData = (overrides = {}) => {
  return {
    title: 'Minimal Task',
    ...overrides
  };
};

/**
 * Create invalid task data for testing validation
 * @returns {Array} Array of invalid task data objects
 */
const createInvalidTaskData = () => {
  return [
    { description: 'Task without title' }, // Missing title
    { title: '', description: 'Empty title' }, // Empty title
    { title: 123, description: 'Number as title' }, // Wrong type
    { title: 'Valid Title', completed: 'not-boolean' }, // Wrong type for completed
    { title: null, description: 'Null title' }, // Null title
  ];
};

/**
 * Wait for specified milliseconds (for testing async operations)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after specified time
 */
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Clear all test data from database
 * @returns {Promise} Promise that resolves when data is cleared
 */
const clearTestData = async () => {
  await Task.deleteMany({});
};

/**
 * Get test database statistics
 * @returns {Promise<Object>} Database stats
 */
const getTestDatabaseStats = async () => {
  const taskCount = await Task.countDocuments();
  const completedCount = await Task.countDocuments({ completed: true });
  const incompleteCount = await Task.countDocuments({ completed: false });

  return {
    total: taskCount,
    completed: completedCount,
    incomplete: incompleteCount
  };
};

/**
 * Assert task equality (ignoring _id and timestamps)
 * @param {Object} actual - Actual task object
 * @param {Object} expected - Expected task object
 */
const assertTaskEquals = (actual, expected) => {
  expect(actual.title).toBe(expected.title);
  expect(actual.description).toBe(expected.description);
  expect(actual.completed).toBe(expected.completed);
};

/**
 * Create test scenarios for API testing
 * @returns {Array} Array of test scenarios
 */
const getApiTestScenarios = () => {
  return [
    {
      name: 'Valid complete task',
      data: { title: 'API Test Task', description: 'API Description', completed: false },
      expectedStatus: 201
    },
    {
      name: 'Task without description',
      data: { title: 'No Description Task', completed: true },
      expectedStatus: 201
    },
    {
      name: 'Task with minimal data',
      data: { title: 'Minimal Task' },
      expectedStatus: 201
    },
    {
      name: 'Empty request body',
      data: {},
      expectedStatus: 400
    },
    {
      name: 'Invalid data types',
      data: { title: 123, description: true, completed: 'yes' },
      expectedStatus: [400, 422] // Could be either depending on validation
    }
  ];
};

/**
 * Performance test helper - measure execution time
 * @param {Function} asyncFunction - Function to measure
 * @returns {Promise<Object>} Object with result and execution time
 */
const measureExecutionTime = async (asyncFunction) => {
  const startTime = Date.now();
  const result = await asyncFunction();
  const executionTime = Date.now() - startTime;

  return {
    result,
    executionTime
  };
};

/**
 * Create test data for stress testing
 * @param {number} count - Number of tasks to create
 * @returns {Array} Array of task data objects
 */
const createStressTestData = (count = 100) => {
  return Array.from({ length: count }, (_, index) => ({
    title: `Stress Test Task ${index + 1}`,
    description: `Description for stress test task ${index + 1}`,
    completed: Math.random() > 0.5
  }));
};

module.exports = {
  createTestTask,
  createMultipleTestTasks,
  generateValidObjectId,
  generateInvalidObjectId,
  createCompleteTaskData,
  createMinimalTaskData,
  createInvalidTaskData,
  delay,
  clearTestData,
  getTestDatabaseStats,
  assertTaskEquals,
  getApiTestScenarios,
  measureExecutionTime,
  createStressTestData
};