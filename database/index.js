// const { Pool } = require("pg")
// require("dotenv").config()
// /* ***************
//  * Connection Pool
//  * SSL Object needed for local testing of app
//  * But will cause problems in production environment
//  * If - else will make determination which to use
//  * *************** */
// let pool
// if (process.env.NODE_ENV == "development") {
//   pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   })

// // Added for troubleshooting queries
// // during development
//   module.exports = {
//     async query(text, params) {
//       try {
//         const res = await pool.query(text, params)
//         console.log("executed query", { text })
//         return res
//       } catch (error) {
//         console.error("error in query", { text })
//         throw error
//       }
//     },
//   }
// } else {
//   pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//   })
//   module.exports = pool
// }

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL env var');
}

let dbHost = '';
try {
  dbHost = new URL(connectionString).hostname;
} catch (err) {
}

const useSSL =
  process.env.DATABASE_SSL === 'true' ||
  process.env.PGSSLMODE === 'require' ||
  process.env.NODE_ENV === 'production' ||
  /render\.com$/.test(dbHost);

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.PG_MAX_CLIENTS, 10) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected idle client error', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};