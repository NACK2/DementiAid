const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables',
  );
  process.exit(1);
}

if (!twilioAccountSid || !twilioAuthToken) {
  console.warn(
    'Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN — SMS features will be disabled',
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('_dummy_ping').select('*').limit(1);
    // A "relation does not exist" error still means the connection works
    if (
      error &&
      !error.message.includes('does not exist') &&
      !error.message.includes('Could not find')
    ) {
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
}

async function sendTwilioMessage(to, body) {
  const client = twilio(twilioAccountSid, twilioAuthToken);
  try {
    // hard coded for testing purposes
    const message = await client.messages.create({
      body,
      from: '+15394895603',
      to: '+18777804236',
    });
    console.log('Twilio message sent:', message.sid);
    return message.sid;
  } catch (err) {
    console.error('Failed to send Twilio message:', err);
    throw err;
  }
}

async function textToSpeech(text) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_TTS_API_KEY environment variable');
  }

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'en-US', name: 'en-US-Standard-D' },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('Google TTS API error:', err);
    throw new Error('Google TTS API error: ' + response.status);
  }

  const data = await response.json();
  return Buffer.from(data.audioContent, 'base64');
}

async function getPatients() {
  const { data, error } = await supabase.from('patients').select('*');
  if (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
  return data;
}

async function getPatientById(id) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching patient by id:', error);
    return null;
  }
  return data;
}

async function addPatient(patient) {
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single();
  if (error) {
    console.error('Error adding patient:', error);
    return null;
  }
  return data;
}

async function invitePatientByPhone(patient) {
  const { phone_num, ...patientData } = patient;
  let userId;

  // create user in supabase auth user schema
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      phone: phone_num,
      phone_confirm: true,
      user_metadata: {
        role: 'patient',
        // full_name: `${patientData.first_name} ${patientData.last_name}`,
      },
    });

  if (authError) throw authError;
  userId = authUser.user.id;

  const { error: dbError } = await supabase
    .from('patients')
    .insert([{ id: userId, phone_num, ...patientData }]);
  if (dbError) throw dbError;

  const { error: otpError } = await supabase.auth.signInWithOtp({
    phone: phone_num,
  });
  // clean if the number is invalid (removes user from auth schema)
  if (otpError) {
    await supabase.auth.admin.deleteUser(userId);
    throw otpError;
  }

  return { success: true };
}

async function updatePatient(id, updates) {
  const { error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id);
  if (error) {
    console.error('Error updating patient:', error);
    return false;
  }
  return true;
}

async function deletePatient(id) {
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
  return true;
}

async function getJournals() {
  const { data, error } = await supabase.from('journal').select('*');
  if (error) {
    console.error('Error fetching journals:', error);
    return [];
  }
  return data;
}

async function addJournalEntry(entry) {
  const { error } = await supabase.from('journal').insert(entry);
  if (error) {
    console.error('Error adding journal entry:', error);
    return false;
  }
  return true;
}

async function updateJournalEntry(patientId, date, updates) {
  const { error } = await supabase
    .from('journal')
    .update(updates)
    .eq('patient_id', patientId)
    .eq('date', date);
  if (error) {
    console.error('Error updating journal entry:', error);
    return false;
  }
  return true;
}

async function deleteJournalEntry(patientId, date) {
  const { error } = await supabase
    .from('journal')
    .delete()
    .eq('patient_id', patientId)
    .eq('date', date);
  if (error) {
    console.error('Error deleting journal entry:', error);
    return false;
  }
  return true;
}

async function getReminderSettings() {
  const { data, error } = await supabase.from('reminder_settings').select('*');
  if (error) {
    console.error('Error fetching reminder settings:', error);
    return [];
  }
  return data;
}

async function addReminderSettings(settings) {
  // temporary hard coded id
  // settings.provider_id = 'ab71aec7-ee3e-4f70-9d99-81f65e6ce5c9'
  console.log(settings);
  const { error } = await supabase.from('reminder_settings').insert(settings);
  if (error) {
    console.error('Error adding reminder settings:', error);
    return false;
  }
  return true;
}

async function updateReminderSettings(id, updates) {
  const { error } = await supabase
    .from('reminder_settings')
    .update(updates)
    .eq('id', id);
  if (error) {
    console.error('Error updating reminder settings:', error);
    return false;
  }
  return true;
}

async function deleteReminderSettings(id) {
  const { error } = await supabase
    .from('reminder_settings')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting reminder settings:', error);
    return false;
  }
  return true;
}

async function getProviders() {
  const { data, error } = await supabase.from('providers').select('*');
  if (error) {
    console.error('Error fetching providers:', error);
    return [];
  }
  return data;
}

async function addProvider(provider) {
  const { error } = await supabase.from('providers').insert(provider);
  if (error) {
    console.error('Error adding provider:', error);
    return false;
  }
  return true;
}

async function updateProvider(id, updates) {
  const { error } = await supabase
    .from('providers')
    .update(updates)
    .eq('id', id);
  if (error) {
    console.error('Error updating provider:', error);
    return false;
  }
  return true;
}

async function deleteProvider(id) {
  const { error } = await supabase.from('providers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting provider:', error);
    return false;
  }
  return true;
}

async function getPatientProviders() {
  const { data, error } = await supabase.from('patients_providers').select('*');
  if (error) {
    console.error('Error fetching patient-provider relations:', error);
    return [];
  }
  return data;
}

async function getPatientsByProvider(providerId) {
  // Step 1: get patient_ids for this provider
  const { data: links, error: linkError } = await supabase
    .from('patients_providers')
    .select('patient_id')
    .eq('provider_id', providerId);

  if (linkError) {
    console.error('Error fetching patient-provider links:', linkError);
    return [];
  }

  if (!links || links.length === 0) {
    return [];
  }

  const patientIds = links.map((row) => row.patient_id);

  // Step 2: fetch patients with those IDs
  const { data: patients, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .in('id', patientIds);

  if (patientError) {
    console.error('Error fetching patients:', patientError);
    return [];
  }

  return patients;
}

async function getRemindersByProvider(providerId) {
  const { data, error } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('provider_id', providerId);
  if (error) {
    console.error('Error fetching reminders by provider:', error);
    return [];
  }
  return data;
}

async function getPatientsByProvider(providerId) {
  // Step 1: get patient_ids for this provider
  const { data: links, error: linkError } = await supabase
    .from('patients_providers')
    .select('patient_id')
    .eq('provider_id', providerId);

  if (linkError) {
    console.error('Error fetching patient-provider links:', linkError);
    return [];
  }

  if (!links || links.length === 0) {
    return [];
  }

  const patientIds = links.map((row) => row.patient_id);

  // Step 2: fetch patients with those IDs
  const { data: patients, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .in('id', patientIds);

  if (patientError) {
    console.error('Error fetching patients:', patientError);
    return [];
  }

  return patients;
}

async function getRemindersByProvider(providerId) {
  const { data, error } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('provider_id', providerId);
  if (error) {
    console.error('Error fetching reminders by provider:', error);
    return [];
  }
  return data;
}

async function addPatientProvider(relation) {
  const { error } = await supabase.from('patients_providers').insert(relation);
  if (error) {
    console.error('Error adding patient-provider relation:', error);
    return false;
  }
  return true;
}

async function updatePatientProvider(patientId, providerId, updates) {
  const { error } = await supabase
    .from('patients_providers')
    .update(updates)
    .eq('patient_id', patientId)
    .eq('provider_id', providerId);
  if (error) {
    console.error('Error updating patient-provider relation:', error);
    return false;
  }
  return true;
}

async function deletePatientProvider(patientId, providerId) {
  const { error } = await supabase
    .from('patients_providers')
    .delete()
    .eq('patient_id', patientId)
    .eq('provider_id', providerId);
  if (error) {
    console.error('Error deleting patient-provider relation:', error);
    return false;
  }
  return true;
}

async function getChatbotMessages() {
  const { data, error } = await supabase.from('chatbot_messages').select('*');
  if (error) {
    console.error('Error fetching chatbot messages:', error);
    return [];
  }
  return data;
}

async function addChatbotMessage(message) {
  const { error } = await supabase.from('chatbot_messages').insert(message);
  if (error) {
    console.error('Error adding chatbot message:', error);
    return false;
  }
  return true;
}

async function updateChatbotMessage(id, updates) {
  const { error } = await supabase
    .from('chatbot_messages')
    .update(updates)
    .eq('id', id);
  if (error) {
    console.error('Error updating chatbot message:', error);
    return false;
  }
  return true;
}

async function deleteChatbotMessage(id) {
  const { error } = await supabase
    .from('chatbot_messages')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting chatbot message:', error);
    return false;
  }
  return true;
}

async function getMessages() {
  const { data, error } = await supabase.from('messages').select('*');
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data;
}

async function addMessage(message) {
  const { error } = await supabase.from('messages').insert(message);
  if (error) {
    console.error('Error adding message:', error);
    return false;
  }
  return true;
}

async function updateMessage(id, updates) {
  const { error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', id);
  if (error) {
    console.error('Error updating message:', error);
    return false;
  }
  return true;
}

async function deleteMessage(id) {
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) {
    console.error('Error deleting message:', error);
    return false;
  }
  return true;
}

async function getReminderSettingsByPatient(patientId) {
  const { data: links, error: linkError } = await supabase
    .from('patients_reminder_settings')
    .select('reminder_settings_id')
    .eq('patient_id', patientId);

  if (linkError) {
    console.error('Error fetching patient reminder setting links:', linkError);
    return [];
  }

  if (!links || links.length === 0) {
    return [];
  }

  const settingIds = links.map((row) => row.reminder_settings_id);

  const { data: settings, error: settingsError } = await supabase
    .from('reminder_settings')
    .select('*')
    .in('id', settingIds);

  if (settingsError) {
    console.error('Error fetching reminder settings:', settingsError);
    return [];
  }

  return settings;
}

async function addPatientReminderSetting(patientId, reminderSettingsId) {
  const { error } = await supabase
    .from('patients_reminder_settings')
    .insert({
      patient_id: patientId,
      reminder_settings_id: reminderSettingsId,
    });
  if (error) {
    console.error('Error adding patient reminder setting:', error);
    return false;
  }
  return true;
}

async function deletePatientReminderSetting(patientId, reminderSettingsId) {
  const { error } = await supabase
    .from('patients_reminder_settings')
    .delete()
    .eq('patient_id', patientId)
    .eq('reminder_settings_id', reminderSettingsId);
  if (error) {
    console.error('Error deleting patient reminder setting:', error);
    return false;
  }
  return true;
}

async function chatWithGemini(patientId, userMessage) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  // Get conversation history for this patient
  const { data: history } = await supabase
    .from('chatbot_messages')
    .select('sender, content')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });

  // Build Gemini conversation
  const contents = (history || []).map((msg) => ({
    role: msg.sender === 'patient' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  // Call Gemini API via Vertex AI
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('Gemini API error:', err);
    throw new Error('Gemini API error: ' + response.status);
  }

  const data = await response.json();
  const botReply =
    data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

  // Save both messages to chatbot_messages
  await addChatbotMessage({
    patient_id: patientId,
    sender: 'patient',
    content: userMessage,
  });
  await addChatbotMessage({
    patient_id: patientId,
    sender: 'bot',
    content: botReply,
  });

  return botReply;
}
module.exports = {
  supabase,
  testSupabaseConnection,
  sendTwilioMessage,
  textToSpeech,

  // Patients
  getPatients,
  getPatientById,
  addPatient,
  invitePatientByPhone,
  updatePatient,
  deletePatient,

  // Providers
  getProviders,
  addProvider,
  updateProvider,
  deleteProvider,

  // Journals
  getJournals,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,

  // Reminder Settings
  getReminderSettings,
  addReminderSettings,
  updateReminderSettings,
  deleteReminderSettings,
  getReminderSettingsByPatient,
  addPatientReminderSetting,
  deletePatientReminderSetting,

  // Patient ↔ Provider relationships
  getPatientProviders,
  getPatientsByProvider,
  getRemindersByProvider,
  addPatientProvider,
  updatePatientProvider,
  deletePatientProvider,

  // Chatbot
  getChatbotMessages,
  addChatbotMessage,
  updateChatbotMessage,
  deleteChatbotMessage,
  chatWithGemini,

  // Messages
  getMessages,
  addMessage,
  updateMessage,
  deleteMessage,
};