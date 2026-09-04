import { Pool, PoolClient, QueryResult } from 'pg';

const globalForPostgres = globalThis as typeof globalThis & {
  postgresPool?: Pool;
};

// Reuse one pool across Next.js hot reloads so development compilation does not
// create competing pools or drop in-flight database connections.
const pool = globalForPostgres.postgresPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPostgres.postgresPool = pool;
}

// Event listeners for pool
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Helper function to execute queries
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Query executed in ${duration}ms, rows: ${result.rowCount}`);
    return result;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

// Helper function to get a client from the pool (for transactions)
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Helper function to run a transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Helper function to check database connection
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now');
    console.log(`✅ Database connection successful: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection check failed:', error);
    return false;
  }
}

// Helper function to get database version
export async function getDatabaseVersion(): Promise<string> {
  const result = await query('SELECT version()');
  return result.rows[0].version;
}

export default pool;
