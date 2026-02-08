# DementiAid
### Hack the Coast 2026
Nick, Hugo, John, Alex

DementiAid is a tool to help those with dementia promote a healthier lifestlye.

This project utilizes a provider-patient model, where authenticated providers are in charge of patients and can perform actions such as sending scheduled reminders via SMS messages. 
E.g. providers can set a reminder for "Take your medicine" with a frequency of once every 2 days at 3pm, and this notification will be sent via SMS and also appear on the patient's dashboard.

This application also provides journal entries, schedules, and a chatbot (via Gemini API) for the patient.

Tech Stack: The frontend is created with React + TypeScript, the backend is Node.js + Express.js (among other libraries), and the database + authentication utilize Supabase.
