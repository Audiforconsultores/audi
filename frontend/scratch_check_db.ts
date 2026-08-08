import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sitmpmmrjpjqxkexrwwh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdG1wbW1yanBqcXhrZXhyd3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzIzODMsImV4cCI6MjEwMTcwODM4M30.ilYBF0l02UPbUd3RwjgUoWGhgUQZXUrn8n0X_f_L214';

const main = async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: employees, error: errEmp } = await supabase.from('employees').select('*');
  const { data: timeRecords, error: errTr } = await supabase.from('time_records').select('*');

  console.log('--- EMPLOYEES ---');
  if (errEmp) console.error(errEmp);
  else console.log(employees);

  console.log('--- TIME RECORDS ---');
  if (errTr) console.error(errTr);
  else console.log(timeRecords);
};

main();
