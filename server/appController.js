const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
router.get('/check-db-connection', async (req, res) => {
    const isConnected = await appService.testSupabaseConnection();
    if (isConnected) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/patients', async (req, res) => {
    const patients = await appService.getPatients();
    res.json(patients);
});

module.exports = router;
