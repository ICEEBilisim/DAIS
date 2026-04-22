import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://muwbfxluwtsbgzadrhgy.supabase.co';
const supabaseKey = 'sb_publishable_6Jt7n0CHEiwOXwlL0zJW1A_P8R6iuAG';

export const supabase = createClient(supabaseUrl, supabaseKey);
