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

router.post('/send-sms', async (req, res) => {
  const { to, body } = req.body;
  if (!to || !body) {
    return res.status(400).send('Missing "to" or "body" in request');
  }

  try {
    const messageSid = await appService.sendTwilioMessage(to, body);
    res.json({ message: `Message sent with SID: ${messageSid}` });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      code: err.code,
      moreInfo: err.moreInfo,
    });
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

router.get('/journal', async (req, res) => {
    const journal = await appService.getJournals();
    res.json(journal);
});

router.post('/journal', async (req, res) => {
    const newEntry = req.body;
    const success = await appService.addJournalEntry(newEntry);
    if (success) {
        res.status(201).json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to add journal entry' });
    }
});

router.put('/journal/:patientId/:date', async (req, res) => {
    const { patientId, date } = req.params;
    const updates = req.body;
    const success = await appService.updateJournalEntry(patientId, date, updates);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update journal entry' });
    }
});

router.delete('/journal/:patientId/:date', async (req, res) => {
    const { patientId, date } = req.params;
    const success = await appService.deleteJournalEntry(patientId, date);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete journal entry' });
    }
});

router.get('/reminders', async (req, res) => {
    const settings = await appService.getReminderSettings();
    res.json(settings);
});

router.post('/reminders', async (req, res) => {
    const newSettings = req.body;
    const success = await appService.addReminderSettings(newSettings);
    if (success) {
        res.status(201).json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to add reminder settings' });
    }
});

router.put('/reminders/:id', async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const success = await appService.updateReminderSettings(id, updates);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update reminder settings' });
    }
});

router.delete('/reminders/:id', async (req, res) => {
    const id = req.params.id;
    const success = await appService.deleteReminderSettings(id);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete reminder settings' });
    }
});

router.get('/providers', async (req, res) => {
    const providers = await appService.getProviders();
    res.json(providers);
});

router.post('/providers', async (req, res) => {
    const newProvider = req.body;
    const success = await appService.addProvider(newProvider);
    if (success) {
        res.status(201).json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to add provider' });
    }
});

router.put('/providers/:id', async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const success = await appService.updateProvider(id, updates);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update provider' });
    }
});

router.delete('/providers/:id', async (req, res) => {
    const id = req.params.id;
    const success = await appService.deleteProvider(id);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete provider' });
    }
});

router.get('/patients-providers', async (req, res) => {
    const relations = await appService.getPatientProviders();
    res.json(relations);
});

router.post('/patients-providers', async (req, res) => {
    const newRelation = req.body;
    const success = await appService.addPatientProvider(newRelation);
    if (success) {
        res.status(201).json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to add patient-provider relation' });
    }
});

router.put('/patients-providers/:patientId/:providerId', async (req, res) => {
    const { patientId, providerId } = req.params;
    const updates = req.body;
    const success = await appService.updatePatientProvider(patientId, providerId, updates);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update patient-provider relation' });
    }
});

router.delete('/patients-providers/:patientId/:providerId', async (req, res) => {
    const { patientId, providerId } = req.params;
    const success = await appService.deletePatientProvider(patientId, providerId);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete patient-provider relation' });
    }
});


module.exports = router;
