const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.PG_DB,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: 'postgres',
    logging: false, // set to console.log to see raw SQL queries during debugging
    pool: {
      max: 10,     // max 10 simultaneous connections
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectPostgres = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true }); // auto-creates/updates tables based on models
  console.log('✅ PostgreSQL connected');
};

module.exports = { sequelize, connectPostgres };