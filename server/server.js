require('dotenv').config();
const express = require('express');
const cors = require('cors');
const appController = require('./appController');
const { startReminderCron } = require('./reminderCron');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Mount the router
app.use('/', appController);

// ----------------------------------------------------------
// Starting the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  startReminderCron();
});
