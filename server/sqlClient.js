import { neon } from '@neondatabase/serverless';
import pg from 'pg';

export function createSql(url) {
  if (!url) return null;

  // If using Neon serverless HTTP
  if (url.includes('.neon.tech')) {
    return neon(url);
  }

  // Standard PostgreSQL (Supabase, local PostgreSQL, AWS RDS, etc.)
  const pool = new pg.Pool({
    connectionString: url,
    ssl: url.includes('localhost') || url.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  const sql = function(strings, ...values) {
    let queryText = '';
    for (let i = 0; i < strings.length; i++) {
      queryText += strings[i];
      if (i < values.length) {
        queryText += '$' + (i + 1);
      }
    }

    return {
      text: queryText,
      values: values,
      then(onFulfilled, onRejected) {
        return pool.query(queryText, values)
          .then(res => onFulfilled ? onFulfilled(res.rows) : res.rows)
          .catch(onRejected);
      },
      catch(onRejected) {
        return pool.query(queryText, values)
          .then(res => res.rows)
          .catch(onRejected);
      }
    };
  };

  sql.query = async (text, params = []) => {
    const res = await pool.query(text, params);
    return res.rows;
  };

  sql.transaction = async (queries) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const q of queries) {
        if (q && q.text) {
          const res = await client.query(q.text, q.values);
          results.push(res.rows);
        } else if (typeof q === 'function') {
          results.push(await q(client));
        } else {
          results.push(await q);
        }
      }
      await client.query('COMMIT');
      return results;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  };

  sql.pool = pool;
  return sql;
}
