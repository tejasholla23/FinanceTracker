const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Transaction = require('../models/Transaction');
const cache = require('../utils/cache');

exports.getInsights = async (req, res) => {
  try {
    // Extract userId from JWT
    const userId = req.user.id;
    const cacheKey = `insights_${userId}`;

    // 1. Check if cache exists
    const cachedInsights = cache.get(cacheKey);
    if (cachedInsights) {
      return res.status(200).json({
        success: true,
        insights: cachedInsights,
        source: 'cache' // optional: just to prove it works
      });
    }

    // Advanced SQL with Isolation for Anomaly Detection
    const query = `
      WITH CategoryStats AS (
          -- 1. Historical baseline (excluding current month to prevent overlap)
          SELECT 
              category,
              AVG(amount) as avg_amount,
              COALESCE(STDDEV(amount), 0) as stddev_amount,
              COUNT(*) as hist_count
          FROM "Transactions"
          WHERE "userId" = :userId 
            AND type = 'expense'
            AND date < date_trunc('month', CURRENT_DATE)
            AND date >= CURRENT_DATE - INTERVAL '90 days'
          GROUP BY category
          HAVING COUNT(*) >= 3 -- Require at least 3 transactions to establish a pattern
      ),
      CurrentMonthTransactions AS (
          -- 2. Individual transactions this month
          SELECT 
              id,
              category,
              amount,
              description
          FROM "Transactions"
          WHERE "userId" = :userId
            AND type = 'expense'
            AND date >= date_trunc('month', CURRENT_DATE)
      ),
      CurrentMonthTotals AS (
          -- 3. Total monthly spending
          SELECT 
              category,
              SUM(amount) as total_amount
          FROM CurrentMonthTransactions
          GROUP BY category
      )
      -- 4. Combine Transaction-level and Aggregate-level anomalies
      SELECT 
          'transaction' as type,
          t.category,
          t.amount,
          s.avg_amount,
          NULL as total_amount,
          NULL as percentage_increase
      FROM CurrentMonthTransactions t
      JOIN CategoryStats s ON t.category = s.category
      WHERE t.amount > (s.avg_amount + 3 * s.stddev_amount)

      UNION ALL

      SELECT 
          'aggregate' as type,
          m.category,
          NULL as amount,
          s.avg_amount,
          m.total_amount,
          ((m.total_amount - s.avg_amount) / s.avg_amount) * 100 as percentage_increase
      FROM CurrentMonthTotals m
      JOIN CategoryStats s ON m.category = s.category
      WHERE m.total_amount > (s.avg_amount + 2 * s.stddev_amount)
        AND NOT EXISTS (
            -- Avoid double alerting if the individual transaction alert already explains it
            SELECT 1 FROM CurrentMonthTransactions t2 
            WHERE t2.category = m.category 
              AND t2.amount > (s.avg_amount + 3 * s.stddev_amount)
        );
    `;

    const results = await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });

    let insights = [];

    if (!results || results.length === 0) {
      // Check if they even have history
      const hasHistory = await Transaction.count({
        where: { userId, type: 'expense' }
      });
      
      if (hasHistory < 3) {
        insights = ["ℹ️ We're still learning your spending patterns. Add a few more transactions to see insights!"];
      } else {
        insights = ["🎉 No unusual spending detected. You're doing great!"];
      }
    } else {
      // Convert to human readable strings
      insights = results.map(row => {
        if (row.type === 'transaction') {
          return `⚠️ A transaction of ₹${Number.parseFloat(row.amount).toLocaleString()} in '${row.category}' is unusually high compared to your usual ₹${Math.round(row.avg_amount)} average.`;
        } else {
          return `📈 Your total ${row.category} spending is ${Math.round(row.percentage_increase)}% higher than your historical average.`;
        }
      });
    }

    // 2. Store result in cache
    cache.set(cacheKey, insights);

    return res.status(200).json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error fetching insights' 
    });
  }
};
