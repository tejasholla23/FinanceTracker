const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

/**
 * Returns true if the recurring transaction is due for a new copy today.
 * Compares lastExecutedAt (or original date) against today using the frequency.
 */
function isDue(transaction, today) {
  // If never executed before, use the original transaction date as reference
  const reference = transaction.lastExecutedAt
    ? new Date(transaction.lastExecutedAt)
    : new Date(transaction.date);

  // Normalize both to midnight UTC to avoid time-of-day skew
  const refMidnight = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate())
  );
  const todayMidnight = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  const diffMs = todayMidnight - refMidnight;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  switch (transaction.recurringFrequency) {
    case 'daily':
      return diffDays >= 1;
    case 'weekly':
      return diffDays >= 7;
    case 'monthly':
      // Check if we've crossed to the same day-of-month in a later month
      return (
        todayMidnight.getUTCMonth() !== refMidnight.getUTCMonth() ||
        todayMidnight.getUTCFullYear() !== refMidnight.getUTCFullYear()
      ) && diffDays >= 28; // Safety: minimum 28 days to prevent early firing
    case 'yearly':
      return diffDays >= 365;
    default:
      return false;
  }
}

/**
 * Main service function.
 * - Queries all isRecurring = true transactions.
 * - Checks each one for due date.
 * - Creates a new transaction copy with today's date.
 * - Updates lastExecutedAt on the template to today.
 *
 * @returns {{ processed: number, skipped: number, errors: number }}
 */
async function processRecurringTransactions() {
  const today = new Date();
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  console.log(`[RecurringService] Starting run at ${today.toISOString()}`);

  // Fetch all recurring transaction templates
  const recurringTemplates = await Transaction.findAll({
    where: {
      isRecurring: true,
      recurringFrequency: { [Op.not]: null },
    },
  });

  console.log(`[RecurringService] Found ${recurringTemplates.length} recurring template(s).`);

  for (const template of recurringTemplates) {
    try {
      if (!isDue(template, today)) {
        skipped++;
        continue;
      }

      // Create a new non-recurring copy with today's date
      await Transaction.create({
        userId: template.userId,
        category: template.category,
        amount: template.amount,
        type: template.type,
        description: template.description
          ? `[Auto] ${template.description}`
          : '[Auto-generated recurring transaction]',
        date: today,
        tags: template.tags || [],
        isRecurring: false,       // The copy is NOT a template, it's a real entry
        recurringFrequency: null,
        lastExecutedAt: null,
      });

      // Stamp the template with today so we don't re-process it
      await template.update({ lastExecutedAt: today });

      console.log(
        `[RecurringService] Created copy for template ${template.id} ` +
        `(userId: ${template.userId}, freq: ${template.recurringFrequency})`
      );
      processed++;
    } catch (err) {
      console.error(`[RecurringService] Error processing template ${template.id}:`, err.message);
      errors++;
    }
  }

  console.log(
    `[RecurringService] Done. processed=${processed}, skipped=${skipped}, errors=${errors}`
  );
  return { processed, skipped, errors };
}

module.exports = { processRecurringTransactions };
