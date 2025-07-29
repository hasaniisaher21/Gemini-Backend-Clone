const { Pool } = require('pg');
require('dotenv').config();

// The Pool will use the DATABASE_URL environment variable automatically
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
