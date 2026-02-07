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

module.exports = {
    supabase,
    testSupabaseConnection,
};
