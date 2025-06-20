const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// CREATE
router.post('/tasks', async (req, res) => {
  const newTask = new Task(req.body);
  const saved = await newTask.save();
  res.json(saved);
});

// READ
router.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// UPDATE
router.put('/tasks/:id', async (req, res) => {
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
router.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

module.exports = router;