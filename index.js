const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());  // Lets your server accept JSON input

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

// Default route
app.get('/', (req, res) => {
  res.send("API Server is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const taskRoutes = require('./routes/taskroutes');
app.use('/api', taskRoutes);  // All task APIs start with /api