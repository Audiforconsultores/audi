import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sitmpmmrjpjqxkexrwwh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdG1wbW1yanBqcXhrZXhyd3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzIzODMsImV4cCI6MjEwMTcwODM4M30.ilYBF0l02UPbUd3RwjgUoWGhgUQZXUrn8n0X_f_L214';

const main = async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('employees')
    .select('*');

  if (error) {
    console.error('Erro ao buscar:', error);
  } else {
    console.log('Sucesso! Colaboradores no Banco:', data);
  }
};

main();
