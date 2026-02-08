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
module.exports = {
    supabase,
    testSupabaseConnection,
    getPatients,
    addPatient,
    updatePatient,
    deletePatient,
};
