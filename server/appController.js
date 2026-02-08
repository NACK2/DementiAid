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

module.exports = router;
