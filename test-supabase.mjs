import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fpikysywaihykgdhoeim.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwaWt5c3l3YWloeWtnZGhvZWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY1NzAyOSwiZXhwIjoyMDg2MjMzMDI5fQ.5HKZtHFAngeXjNE6oHOKTA_vUXLocq3a7NqxHXZZD3c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log('Testing connection...');
  const { data, error } = await supabase.from('sites').select('id').limit(1);
  
  if (error) {
    console.error('❌ Connection Failed:', error.message);
  } else {
    console.log('✅ Connection Successful! Data:', data);
  }
}

test();
