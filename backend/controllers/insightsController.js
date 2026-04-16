const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/db');
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

    // Raw SQL with CTEs for Anomaly Detection
    const query = `
      WITH UserCategoryStats AS (
          SELECT 
              category,
              AVG(amount) as avg_spending,
              COALESCE(STDDEV(amount), 0) as stddev_spending
          FROM "Transactions"
          WHERE "userId" = :userId 
            AND type = 'expense' 
            AND date >= CURRENT_DATE - INTERVAL '90 days'
          GROUP BY category
      ),
      CurrentMonthSpending AS (
          SELECT 
              category,
              SUM(amount) as total_amount
          FROM "Transactions"
          WHERE "userId" = :userId 
            AND type = 'expense' 
            AND date >= date_trunc('month', CURRENT_DATE)
          GROUP BY category
      )
      SELECT 
          c.category,
          c.total_amount,
          s.avg_spending,
          s.stddev_spending,
          ((c.total_amount - s.avg_spending) / s.avg_spending) * 100 as percentage_increase
      FROM CurrentMonthSpending c
      JOIN UserCategoryStats s ON c.category = s.category
      WHERE c.total_amount > (s.avg_spending + s.stddev_spending) 
        AND s.avg_spending > 0;
    `;

    // Execute parametrized query
    const results = await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });

    // Handle empty results cleanly
    if (!results || results.length === 0) {
      const positiveInsight = ["🎉 You're on track! No unexpected spending anomalies detected this month."];
      cache.set(cacheKey, positiveInsight);
      
      return res.status(200).json({
        success: true,
        insights: positiveInsight
      });
    }

    // Convert to human readable strings
    const insights = results.map(row => {
      const percentage = Math.round(row.percentage_increase);
      return `⚠️ Your ${row.category} spending is ${percentage}% higher than your usual average.`;
    });

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
