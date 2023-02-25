const { Pool } = require('pg');
const PG_URI = process.env.DB_URI;

const pool = new Pool({
  connectionString: PG_URI,
});

export const db = {
  query: (text: any, params: any, callback?: any) => {
      // console.log(`executed query`, text);
      return pool.query(text, params, callback);
    }
}