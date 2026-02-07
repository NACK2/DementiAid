import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

function App() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    async function getPatients() {
      const { data } = await supabase.from("patients").select();
      console.log("patients data:", data);
      setPatients(data);
    }
    getPatients();
  }, []);

  return (
    <>
      <ul>
        {patients.map((patient) => (
          <li key={patient.name}>{patient.name}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
