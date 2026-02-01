import { insertFromJson, getStats, resetSeq, pool } from './direct-insert.js';
import fs from 'fs';

const BATCH_SIZE = 15;
const TOTAL_USERS = 1294;

async function main() {
  console.log("=== User Migration to Supabase ===\n");
  
  const initialStats = await getStats();
  console.log(`Initial: ${initialStats.count} users (max ID: ${initialStats.maxId})`);
  
  // Read all JSON batch files from /tmp/users
  const dir = '/tmp/users';
  if (!fs.existsSync(dir)) {
    console.log("Error: No batch files found in /tmp/users");
    console.log("Run exports first to populate batch files.");
    process.exit(1);
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''));
    const numB = parseInt(b.replace(/\D/g, ''));
    return numA - numB;
  });
  
  if (files.length === 0) {
    console.log("No JSON files found.");
    process.exit(1);
  }
  
  console.log(`Found ${files.length} batch files\n`);
  
  let totalInserted = 0;
  let totalSkipped = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(`${dir}/${file}`, 'utf-8');
    const result = await insertFromJson(content);
    totalInserted += result.inserted;
    totalSkipped += result.skipped;
    console.log(`${file}: +${result.inserted} ins, ${result.skipped} skip`);
  }
  
  console.log(`\n--- Summary ---`);
  console.log(`Total inserted: ${totalInserted}`);
  console.log(`Total skipped: ${totalSkipped}`);
  
  await resetSeq();
  
  const finalStats = await getStats();
  console.log(`Final: ${finalStats.count} users (max ID: ${finalStats.maxId})`);
  
  await pool.end();
}

main().catch(console.error);
