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

router.get('/providers', async (req, res) => {
    const providers = await appService.getProviders();
    res.json(providers);
});

router.post('/providers', async (req, res) => {
    const newProvider = req.body;
    const addedProvider = await appService.addProvider(newProvider);
    if(addedProvider) {
        res.status(201).json({addedProvider});
    } else {
        res.status(500).json({ error: 'Failed to add provider' });
    }
});

router.put('/providers/:id', async (req, res) => {
    const providerID = req.params.id;
    const updates = req.body;
    const updatedProvider = await appService.updatePatient(providerID, updates);
    if (updatedProvider) {
        res.status(201).json({updatedProvider});
    } else {
        res.status(500).json({ error: 'Failed to update provider' });
    }
});

router.delete('/providers/:id', async (req, res) => {
    const providerId = req.params.id;
    const deletedProvider = await appService.deletePatient(providerID);
    if (deletedProvider) {
        res.json(deletedProvider);
    } else {
        res.status(500).json({ error: 'Failed to delete provider' });
    }
});

router.
module.exports = router;
