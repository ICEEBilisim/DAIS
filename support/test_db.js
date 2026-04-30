import { createClient } from '@supabase/supabase-js';

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../support/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('get_admin_users_schema');
  // OR just fetch one with an invalid column to see the error msg
  const { error: err } = await supabase.from('admin_users').select('nonexistent_column_123').limit(1);
  console.log("Error schema:", err);
}

check();
