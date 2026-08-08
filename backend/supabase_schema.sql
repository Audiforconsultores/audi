-- =======================================================
-- MODELAGEM DE BANCO DE DADOS - PONTO ELETRÔNICO AUDIFOR
-- =======================================================

-- 1. TABELA EMPLOYEES (COLABORADORES)
-- Alimentada via Webhook do Clerk.
CREATE TABLE IF NOT EXISTS employees (
  clerk_id TEXT PRIMARY KEY, -- ID gerado pelo Clerk (ex: user_2x...)
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE, -- Controle de permissão administrativa
  allow_home_office BOOLEAN DEFAULT FALSE, -- Ignora geocerca se TRUE (Home Office)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 2. TABELA TIME_RECORDS (REGISTROS DE PONTO)
-- Armazena as batidas de ponto dos colaboradores.
CREATE TABLE IF NOT EXISTS time_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT REFERENCES employees(clerk_id) ON DELETE CASCADE,
  
  -- Dados do ponto
  record_type TEXT CHECK (record_type IN ('entrada', 'saida_almoco', 'retorno_almoco', 'saida')),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Geolocalização e Validação
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  distance_meters NUMERIC,   -- Distância calculada do escritório no momento da batida
  is_valid BOOLEAN NOT NULL, -- True se estava no raio permitido, False caso contrário
  
  -- Anexo
  photo_path TEXT,           -- Caminho da foto no Supabase Storage
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;

-- =======================================================
-- POLÍTICAS DE SEGURANÇA (RLS) - INTEGRAÇÃO CLERK + SUPABASE
-- =======================================================

-- Função auxiliar para obter o ID do usuário do Clerk a partir do JWT do Supabase
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::TEXT;
$$ LANGUAGE sql STABLE;

-- Função auxiliar para verificar se o usuário logado é Administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM employees WHERE clerk_id = public.clerk_user_id()),
    FALSE
  );
$$ LANGUAGE sql STABLE;

-- Políticas para a tabela EMPLOYEES:
-- 1. Colaboradores comuns podem ler seus próprios dados de cadastro
CREATE POLICY "Employees can select their own record" ON employees
  FOR SELECT
  USING (clerk_id = public.clerk_user_id());

-- 2. Administradores podem visualizar todos os colaboradores
CREATE POLICY "Admins can select all employees" ON employees
  FOR SELECT
  USING (public.is_admin());

-- Políticas para a tabela TIME_RECORDS:
-- 1. Colaboradores podem criar (INSERT) suas próprias batidas de ponto
CREATE POLICY "Employees can insert their own time records" ON time_records
  FOR INSERT
  WITH CHECK (clerk_id = public.clerk_user_id());

-- 2. Colaboradores podem visualizar (SELECT) seu próprio histórico de ponto
CREATE POLICY "Employees can select their own time records" ON time_records
  FOR SELECT
  USING (clerk_id = public.clerk_user_id());

-- 3. Administradores podem ler todas as batidas de ponto
CREATE POLICY "Admins can select all time records" ON time_records
  FOR SELECT
  USING (public.is_admin());

-- =======================================================
-- 3. TABELA EMPLOYEE_PHOTOS (FOTOS DE BIOMETRIA)
-- =======================================================
CREATE TABLE IF NOT EXISTS employee_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT REFERENCES employees(clerk_id) ON DELETE CASCADE,
  time_record_id UUID REFERENCES time_records(id) ON DELETE CASCADE,
  photo_data TEXT NOT NULL, -- Armazena a string Base64 da foto
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE employee_photos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para employee_photos
CREATE POLICY "Employees can insert their own photos" ON employee_photos
  FOR INSERT
  WITH CHECK (clerk_id = public.clerk_user_id());

CREATE POLICY "Admins can select all photos" ON employee_photos
  FOR SELECT
  USING (public.is_admin());

