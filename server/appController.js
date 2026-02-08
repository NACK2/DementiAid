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

router.post('/patients', async (req, res) => {
    const newPatient = req.body;
    const success = await appService.addPatient(newPatient);
    if (success) {
        res.status(201).json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to add patient' });
    }
});

router.put('/patients/:id', async (req, res) => {
    const patientId = req.params.id;
    const updates = req.body;
    const success = await appService.updatePatient(patientId, updates);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

router.delete('/patients/:id', async (req, res) => {
    const patientId = req.params.id;
    const success = await appService.deletePatient(patientId);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});
module.exports = router;
