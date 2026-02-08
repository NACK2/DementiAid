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

router.post('/text-to-speech', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing "text" in request body' });
  }

  try {
    const audioBuffer = await appService.textToSpeech(text);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });
    res.send(audioBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/patients', async (req, res) => {
  const patients = await appService.getPatients();
  res.json(patients);
});

router.post('/patients', async (req, res) => {
  try {
    const patients = await appService.invitePatientByPhone(req.body);
    res.status(201).json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/patients/:id', async (req, res) => {
  const patientId = req.params.id;
  try {
    const patient = await appService.getPatientById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patient' });
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

router.get('/patients/:patientId/reminder-settings', async (req, res) => {
  try {
    const settings = await appService.getReminderSettingsByPatient(
      req.params.patientId
    );
    res.json(settings);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to fetch patient reminder settings' });
  }
});

router.post('/patients/:patientId/reminder-settings', async (req, res) => {
  const { reminder_settings_id } = req.body;
  if (!reminder_settings_id) {
    return res.status(400).json({ error: 'Missing reminder_settings_id' });
  }
  try {
    const success = await appService.addPatientReminderSetting(
      req.params.patientId,
      reminder_settings_id
    );
    if (success) {
      res.status(201).json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to assign reminder setting' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign reminder setting' });
  }
});

router.delete(
  '/patients/:patientId/reminder-settings/:reminderSettingsId',
  async (req, res) => {
    try {
      const success = await appService.deletePatientReminderSetting(
        req.params.patientId,
        req.params.reminderSettingsId
      );
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to remove reminder setting' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to remove reminder setting' });
    }
  }
);

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

router.get('/providers/:providerId/patients', async (req, res) => {
  const patients = await appService.getPatientsByProvider(
    req.params.providerId
  );
  res.json(patients);
});

router.get('/providers/:providerId/reminders', async (req, res) => {
  const reminders = await appService.getRemindersByProvider(
    req.params.providerId
  );
  res.json(reminders);
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
  const success = await appService.updatePatientProvider(
    patientId,
    providerId,
    updates
  );
  if (success) {
    res.json({ success: true });
  } else {
    res
      .status(500)
      .json({ error: 'Failed to update patient-provider relation' });
  }
});

router.delete(
  '/patients-providers/:patientId/:providerId',
  async (req, res) => {
    const { patientId, providerId } = req.params;
    const success = await appService.deletePatientProvider(
      patientId,
      providerId
    );
    if (success) {
      res.json({ success: true });
    } else {
      res
        .status(500)
        .json({ error: 'Failed to delete patient-provider relation' });
    }
  }
);

router.get('/chatbot-messages', async (req, res) => {
  const messages = await appService.getChatbotMessages();
  res.json(messages);
});

router.post('/chatbot-messages', async (req, res) => {
  const newMessage = req.body;
  const success = await appService.addChatbotMessage(newMessage);
  if (success) {
    res.status(201).json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to add chatbot message' });
  }
});

router.put('/chatbot-messages/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const success = await appService.updateChatbotMessage(id, updates);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to update chatbot message' });
  }
});

router.delete('/chatbot-messages/:id', async (req, res) => {
  const id = req.params.id;
  const success = await appService.deleteChatbotMessage(id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to delete chatbot message' });
  }
});

router.get('/messages', async (req, res) => {
  const messages = await appService.getMessages();
  res.json(messages);
});

router.post('/messages', async (req, res) => {
  const newMessage = req.body;
  const success = await appService.addMessage(newMessage);
  if (success) {
    res.status(201).json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to add message' });
  }
});

router.put('/messages/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const success = await appService.updateMessage(id, updates);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to update message' });
  }
});

router.delete('/messages/:id', async (req, res) => {
  const id = req.params.id;
  const success = await appService.deleteMessage(id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});


router.post('/chat', async (req, res) => {
    const { patient_id, message } = req.body;
    if (!patient_id || !message) {
        return res.status(400).json({ error: 'Missing "patient_id" or "message" in request body' });
    }

    try {
        const reply = await appService.chatWithGemini(patient_id, message);
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
