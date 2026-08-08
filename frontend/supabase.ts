import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const obterSupabaseClient = (tokenClerk?: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas no frontend.');
  }

  const opcoes: any = {};
  
  if (tokenClerk) {
    opcoes.global = {
      headers: {
        Authorization: `Bearer ${tokenClerk}`
      }
    };
  }

  return createClient(supabaseUrl, supabaseAnonKey, opcoes);
};
