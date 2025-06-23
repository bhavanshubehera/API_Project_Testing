const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');

// CREATE
router.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

// READ
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE
router.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid task ID format' });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Empty update object' });
  }

  try {
    const updated = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

// DELETE
router.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid task ID format' });
  }

  try {
    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
