import pkg from "pg";
const { Client } = pkg;

async function enableVector() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log("Connected to DB, creating extension...");
  await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
  console.log("Vector extension created.");
  await client.end();
}

enableVector().catch(console.error);
