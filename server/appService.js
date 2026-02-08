const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables'
  );
  process.exit(1);
}

if (!twilioAccountSid || !twilioAuthToken) {
  console.error(
    'Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN environment variables'
  );
  process.exit(1);
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

module.exports = {
  supabase,
  testSupabaseConnection,
  sendTwilioMessage,
};
