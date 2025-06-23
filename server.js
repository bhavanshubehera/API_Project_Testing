const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Accept JSON input

// Routes
const taskRoutes = require('./routes/tasks');
app.use('/api', taskRoutes); // All task APIs start with /api

// Default route
app.get('/', (req, res) => {
  res.send("API Server is running");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB Atlas");

  // Start server only after DB is connected
  if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Export app for testing
module.exports = app;
