require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/activities', require('./routes/activities'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/inputs', require('./routes/inputs'));
app.use('/api/outcomes', require('./routes/outcomes'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/people', require('./routes/people'));
app.use('/api/events', require('./routes/events'));
app.use('/api/accounts', require('./routes/accounts'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifework-manager';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
