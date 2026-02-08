import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function App() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    async function getPatients() {
      const { data } = await supabase.from('patients').select();
      console.log('patients data:', data);
      setPatients(data);
    }
    getPatients();
  }, []);

  return (
    <div>
      <ul>
        {patients.map((patient) => (
          <li key={patient}>{patient.first_name} {patient.last_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
