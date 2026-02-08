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
    const addedPatient = await appService.addPatient(newPatient);
    if (addedPatient) {
        res.status(201).json(addedPatient);
    } else {
        res.status(500).json({ error: 'Failed to add patient' });
    }
});

router.put('/patients/:id', async (req, res) => {
    const patientId = req.params.id;
    const updates = req.body;
    const updatedPatient = await appService.updatePatient(patientId, updates);
    if (updatedPatient) {
        res.json(updatedPatient);
    } else {
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

router.delete('/patients/:id', async (req, res) => {
    const patientId = req.params.id;
    const deletedPatient = await appService.deletePatient(patientId);
    if (deletedPatient) {
        res.json(deletedPatient);
    } else {
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});
module.exports = router;
