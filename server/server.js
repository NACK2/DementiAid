require('dotenv').config();
const express = require('express');
const appController = require('./appController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.static('public'));
app.use(express.json());

// Mount the router
app.use('/', appController);

// ----------------------------------------------------------
// Starting the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
