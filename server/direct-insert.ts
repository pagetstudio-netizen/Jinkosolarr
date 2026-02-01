import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const SUPABASE_URL = process.env.SUPABASE_DATABASE_URL;
if (!SUPABASE_URL) {
  console.error("SUPABASE_DATABASE_URL must be set");
  process.exit(1);
}

const pool = new Pool({ connectionString: SUPABASE_URL });

interface User {
  id: number;
  full_name: string;
  phone: string;
  country: string;
  password: string;
  referral_code: string;
  referred_by: string | null;
  balance: string;
  today_earnings: string;
  total_earnings: string;
  is_admin: boolean;
  is_super_admin: boolean;
  is_banned: boolean;
  is_withdrawal_blocked: boolean;
  is_promoter: boolean;
  must_invite_to_withdraw: boolean;
  has_deposited: boolean;
  has_active_product: boolean;
  created_at: string;
  last_free_product_claim: string | null;
  last_daily_bonus_claim: string | null;
  promoter_set_by: number | null;
  admin_set_by: number | null;
  admin_set_at: string | null;
  admin_pin: string | null;
  is_admin_password_required: boolean;
}

async function insertUser(u: User): Promise<boolean> {
  try {
    const result = await pool.query(`
      INSERT INTO users (
        id, full_name, phone, country, password, referral_code, referred_by,
        balance, today_earnings, total_earnings, is_admin, is_super_admin,
        is_banned, is_withdrawal_blocked, is_promoter, must_invite_to_withdraw,
        has_deposited, has_active_product, created_at, last_free_product_claim,
        last_daily_bonus_claim, promoter_set_by, admin_set_by, admin_set_at,
        admin_pin, is_admin_password_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      u.id, u.full_name, u.phone, u.country, u.password,
      u.referral_code, u.referred_by, u.balance, u.today_earnings,
      u.total_earnings, u.is_admin, u.is_super_admin, u.is_banned,
      u.is_withdrawal_blocked, u.is_promoter, u.must_invite_to_withdraw,
      u.has_deposited, u.has_active_product, u.created_at,
      u.last_free_product_claim, u.last_daily_bonus_claim,
      u.promoter_set_by, u.admin_set_by, u.admin_set_at,
      u.admin_pin, u.is_admin_password_required
    ]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (err: any) {
    console.log(`Error user ${u.id}: ${err.message}`);
    return false;
  }
}

async function insertFromJson(json: string): Promise<{inserted: number, skipped: number}> {
  let inserted = 0, skipped = 0;
  try {
    let clean = json;
    if (clean.startsWith('"')) clean = clean.slice(1);
    if (clean.endsWith('"')) clean = clean.slice(0, -1);
    clean = clean.replace(/\\"/g, '"');
    
    const users: User[] = JSON.parse(clean);
    for (const u of users) {
      const ok = await insertUser(u);
      if (ok) inserted++; else skipped++;
    }
  } catch (e: any) {
    console.log(`Parse error: ${e.message}`);
  }
  return { inserted, skipped };
}

async function getStats() {
  const r = await pool.query("SELECT COUNT(*) as c, COALESCE(MAX(id),0) as m FROM users");
  return { count: parseInt(r.rows[0].c), maxId: parseInt(r.rows[0].m) };
}

async function resetSeq() {
  const r = await pool.query("SELECT COALESCE(MAX(id),0) as m FROM users");
  if (r.rows[0].m > 0) {
    await pool.query(`SELECT setval('users_id_seq', $1, true)`, [r.rows[0].m]);
    console.log(`Sequence reset to ${r.rows[0].m}`);
  }
}

export { insertFromJson, insertUser, getStats, resetSeq, pool };
