const cron = require('node-cron');
const appService = require('./appService');

/**
 * Parse a frequency string like "2 d" into milliseconds.
 * Supported units: h (hours), d (days), w (weeks), m (months ~30d), y (years ~365d)
 */
function frequencyToMs(frequency) {
  const [value, unit] = frequency.split(' ');
  const num = parseInt(value, 10);
  if (isNaN(num)) return null;

  const multipliers = {
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    m: 30 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };

  if (!multipliers[unit]) return null;
  return num * multipliers[unit];
}

/**
 * Check if a reminder is due right now.
 *
 * Logic:
 * - If start_date is in the future → not due
 * - If last_sent_at is null → due if we are past start_date AND the current
 *   time is at or past the time_of_day
 * - If last_sent_at exists → due if (now - last_sent_at) >= frequency interval
 *   AND the current time is at or past the time_of_day
 *
 * We check time_of_day by comparing hours/minutes. The cron runs every minute
 * so we only send when the current minute matches the target minute.
 */
function isReminderDue(assignment) {
  const { setting, last_sent_at } = assignment;
  if (!setting || !setting.time_of_day || !setting.frequency) return false;

  const now = new Date();

  // Check start_date — if set and in the future, not due yet
  if (setting.start_date) {
    const startDate = new Date(setting.start_date);
    if (now < startDate) return false;
  }

  // Check if current time matches the time_of_day (hour & minute)
  const targetTime = new Date(setting.time_of_day);
  const targetHour = targetTime.getUTCHours();
  const targetMinute = targetTime.getUTCMinutes();
  const nowUTCHour = now.getUTCHours();
  const nowUTCMinute = now.getUTCMinutes();

  if (nowUTCHour !== targetHour || nowUTCMinute !== targetMinute) {
    return false;
  }

  // If never sent before, it's due now (we already checked start_date and time)
  if (!last_sent_at) return true;

  // Check if enough time has passed based on frequency
  const intervalMs = frequencyToMs(setting.frequency);
  if (!intervalMs) return false;

  const lastSent = new Date(last_sent_at);
  return now.getTime() - lastSent.getTime() >= intervalMs;
}

/**
 * The main cron tick: fetch all assignments, check which are due, send SMS.
 */
async function processReminders() {
  try {
    const assignments = await appService.getDueReminders();

    for (const assignment of assignments) {
      if (!isReminderDue(assignment)) continue;

      const { patient, setting } = assignment;
      if (!patient || !patient.phone_num || !setting) continue;

      const phoneNumber = patient.phone_num;
      const messageBody = setting.content;

      try {
        console.log(
          `[Cron] Sending reminder to ${patient.first_name} (${phoneNumber}): "${messageBody}"`
        );
        await appService.sendTwilioMessage(phoneNumber, messageBody);
        await appService.updateLastSentAt(
          assignment.patient_id,
          assignment.reminder_settings_id
        );
        console.log(
          `[Cron] Reminder sent and last_sent_at updated for patient ${assignment.patient_id}, setting ${assignment.reminder_settings_id}`
        );
      } catch (err) {
        console.error(
          `[Cron] Failed to send reminder to ${phoneNumber}:`,
          err.message
        );
      }
    }
  } catch (err) {
    console.error('[Cron] Error in processReminders:', err);
  }
}

/**
 * Start the cron job — runs every minute.
 */
function startReminderCron() {
  console.log('[Cron] Reminder scheduler started (runs every minute)');
  cron.schedule('* * * * *', processReminders);
}

module.exports = { startReminderCron, processReminders, isReminderDue };
