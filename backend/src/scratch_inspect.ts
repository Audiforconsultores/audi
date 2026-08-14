import { supabase } from './db.js';

async function main() {
  if (!supabase) {
    console.error('Supabase client is null.');
    return;
  }
  
  console.log('Querying employees table...');
  const { data: emps, error: errEmps } = await supabase
    .from('employees')
    .select('*')
    .limit(1);
    
  if (errEmps) {
    console.error('Error querying employees:', errEmps);
  } else {
    console.log('Employees sample data / columns:', emps);
  }

  console.log('Querying time_records table...');
  const { data: records, error: errRecords } = await supabase
    .from('time_records')
    .select('*')
    .limit(1);
    
  if (errRecords) {
    console.error('Error querying time_records:', errRecords);
  } else {
    console.log('Time records sample data / columns:', records);
  }
}

main();
