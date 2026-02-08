const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
    try {
        const { error } = await supabase.from('_dummy_ping').select('*').limit(1);
        // A "relation does not exist" error still means the connection works
        if (error && !error.message.includes('does not exist') && !error.message.includes('Could not find')) {
            throw error;
        }
        return true;
    } catch (err) {
        console.error('Supabase connection test failed:', err);
        return false;
    }
}

async function getPatients() {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) {
        console.error('Error fetching patients:', error);
        return [];
    }
    return data;
}   

async function addPatient(patient) {
    const { error } = await supabase.from('patients').insert(patient);
    if (error) {
        console.error('Error adding patient:', error);
        return false;
    }
    return true;
}

async function updatePatient(id, updates) {
    const { error } = await supabase.from('patients').update(updates).eq('id', id);
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
    const { error } = await supabase.from('journal').update(updates).eq('patient_id', patientId).eq('date', date);
    if (error) {
        console.error('Error updating journal entry:', error);
        return false;
    }
    return true;
}

async function deleteJournalEntry(patientId, date) {
    const { error } = await supabase.from('journal').delete().eq('patient_id', patientId).eq('date', date);
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
    const { error } = await supabase.from('reminder_settings').insert(settings);
    if (error) {
        console.error('Error adding reminder settings:', error);
        return false;
    }
    return true;
}

async function updateReminderSettings(id, updates) {
    const { error } = await supabase.from('reminder_settings').update(updates).eq('id', id);
    if (error) {
        console.error('Error updating reminder settings:', error);
        return false;
    }
    return true;
}

async function deleteReminderSettings(id) {
    const { error } = await supabase.from('reminder_settings').delete().eq('id', id);
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
    const { error } = await supabase.from('providers').update(updates).eq('id', id);
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

module.exports = {
    supabase,
    testSupabaseConnection,
    getPatients,
    addPatient,
    updatePatient,
    deletePatient,
    getProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    getJournals,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    getReminderSettings,
    addReminderSettings,
    updateReminderSettings,
    deleteReminderSettings,
};      
