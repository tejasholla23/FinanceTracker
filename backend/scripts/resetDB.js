const { sequelize } = require('./config/db');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const resetDatabase = async () => {
  try {
    console.log('Starting database reset...');
    
    // Drop all tables
    await sequelize.drop();
    console.log('All tables dropped');
    
    // Recreate all tables
    await sequelize.sync({ force: true });
    console.log('All tables recreated');
    
    console.log('Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error.message);
    process.exit(1);
  }
};

// Run the reset
resetDatabase();
