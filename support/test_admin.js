import { createClient } from '@supabase/supabase-js';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('admin_users').select('*');
  console.log("Admin Users Data:", data);
  console.log("Error:", error);
}

check();
