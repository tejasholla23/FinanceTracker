const cron = require('node-cron');
const { processRecurringTransactions } = require('../services/recurringService');

/**
 * Schedules the recurring transaction processor.
 *
 * Default schedule: every day at 00:00 (midnight) server time.
 * Cron syntax: '0 0 * * *'
 *   ┌────── minute   (0)
 *   │ ┌──── hour     (0)
 *   │ │ ┌── day      (* = every)
 *   │ │ │ ┌ month    (* = every)
 *   │ │ │ │ ┌ weekday (* = every)
 *   0 0 * * *
 *
 * To test locally more frequently, change to e.g. '* * * * *' (every minute).
 */
function startRecurringJob() {
  const schedule = process.env.RECURRING_CRON_SCHEDULE || '0 0 * * *';

  if (!cron.validate(schedule)) {
    console.error(`[RecurringJob] Invalid cron schedule: "${schedule}". Job NOT started.`);
    return;
  }

  cron.schedule(schedule, async () => {
    console.log('[RecurringJob] Cron triggered — running recurring transaction processor...');
    try {
      const result = await processRecurringTransactions();
      console.log('[RecurringJob] Completed:', result);
    } catch (err) {
      console.error('[RecurringJob] Unexpected error during run:', err.message);
    }
  }, {
    timezone: process.env.TZ || 'Asia/Kolkata', // Use env TZ or default to IST
  });

  console.log(`⏰ [RecurringJob] Scheduled — cron: "${schedule}"`);
}

module.exports = { startRecurringJob };
