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
    const { data, error } = await supabase.from('patients').insert(patient).select();
    if (error) {
        console.error('Error adding patient:', error);
        return null;
    }
    return data[0];
}

async function updatePatient(id, updates) {
    const { data, error } = await supabase.from('patients').update(updates).eq('id', id).select();
    if (error) {
        console.error('Error updating patient:', error);
        return null;
    }
    return data[0];
}

async function deletePatient(id) {
    const { data, error } = await supabase.from('patients').delete().eq('id', id).select();
    if (error) {
        console.error('Error deleting patient:', error);
        return null;
    }
    return data[0];
}

async function getProviders() {
    const { data, error } = await supabase.from('providers').select('*');
    if(error) {
        console.error('Error fetching patients:', error);
        return null;
    }
    return data;
}

async function addProvider(patient) {
    const { data, error } = await supabase.from('providers').insert(patient).select();
    if(error) {
        console.error('Error inserting provider:', error);
        return null;
    }
    return data[0];
}

async function updateProvider(id, udpates) {
    const { data, error } = await supabase.from('providers').update(updates).eq('id', id).select();
    if(error) {
        console.error('Error updating provider:', error);
        return null;
    }
    return data[0];
}

async function deleteProvider(id) {
    const { data, error } = await supabase.from('providers').delete().eq('id', id).select();
    if(error) {
        console.error('Error deleting provider:', error);
        return null;
    }
    return data[0];
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
};
