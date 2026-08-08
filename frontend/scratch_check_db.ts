import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sitmpmmrjpjqxkexrwwh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdG1wbW1yanBqcXhrZXhyd3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzIzODMsImV4cCI6MjEwMTcwODM4M30.ilYBF0l02UPbUd3RwjgUoWGhgUQZXUrn8n0X_f_L214';

const main = async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Deletando registros de ponto para user_3HcNGeWiLBruTAZMw4ezD3D6dKS...');
  
  const { data, error } = await supabase
    .from('time_records')
    .delete()
    .eq('clerk_id', 'user_3HcNGeWiLBruTAZMw4ezD3D6dKS')
    .select(); // Retorna o que foi deletado

  if (error) {
    console.error('Erro ao deletar:', error);
  } else {
    console.log('Sucesso! Registros deletados:', data);
  }
};

main();
