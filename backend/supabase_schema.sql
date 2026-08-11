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

-- Função auxiliar para calcular a distância em metros entre duas coordenadas geográficas (Fórmula de Haversine)
CREATE OR REPLACE FUNCTION public.calcular_distancia_metros(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
RETURNS double precision AS $$
DECLARE
  R double precision := 6371000; -- Raio da Terra em metros
  dLat double precision;
  dLon double precision;
  a double precision;
  c double precision;
  distancia double precision;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  distancia := R * c;
  RETURN round(distancia::numeric, 2)::double precision;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função do trigger para processar e validar o registro de ponto
CREATE OR REPLACE FUNCTION public.processar_time_record()
RETURNS TRIGGER AS $$
DECLARE
  v_allow_home_office boolean;
  v_is_active boolean;
  v_distancia double precision;
  v_raio_permitido double precision := 100.0; -- Limite de 100 metros
  v_lat_escritorio double precision := -15.62964; -- Latitude do escritório Audifor (Jardim Califórnia)
  v_lon_escritorio double precision := -56.07198; -- Longitude do escritório Audifor (Jardim Califórnia)
BEGIN
  -- 1. Forçar horário do servidor
  NEW.recorded_at := NOW();

  -- 2. Obter configuração do colaborador
  SELECT allow_home_office, is_active INTO v_allow_home_office, v_is_active
  FROM employees
  WHERE clerk_id = NEW.clerk_id;

  IF v_is_active IS NULL OR NOT v_is_active THEN
    RAISE EXCEPTION 'Acesso Negado: Colaborador inativo ou não cadastrado no sistema.';
  END IF;

  -- 3. Se for Home Office, liberar sem validar raio e fixar distância como 0
  IF v_allow_home_office THEN
    NEW.distance_meters := 0;
    NEW.is_valid := true;
  ELSE
    -- Calcular distância
    v_distancia := public.calcular_distancia_metros(
      NEW.latitude,
      NEW.longitude,
      v_lat_escritorio,
      v_lon_escritorio
    );
    
    NEW.distance_meters := v_distancia;
    NEW.is_valid := (v_distancia <= v_raio_permitido);

    -- Impedir inserção se estiver fora do raio
    IF NOT NEW.is_valid THEN
      RAISE EXCEPTION 'Acesso Negado: Registro de ponto bloqueado. Você está a % metros de distância, o que fica fora do limite de % metros.',
        round(v_distancia::numeric),
        round(v_raio_permitido::numeric);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a validação antes da inserção
CREATE OR REPLACE TRIGGER trg_processar_time_record
  BEFORE INSERT ON time_records
  FOR EACH ROW
  EXECUTE FUNCTION public.processar_time_record();

-- Políticas para a tabela EMPLOYEES:
-- 1. Colaboradores comuns podem ler seus próprios dados de cadastro
CREATE POLICY "Employees can select their own record" ON employees
  FOR SELECT
  USING (clerk_id = public.clerk_user_id());

-- 2. Administradores podem visualizar todos os colaboradores
CREATE POLICY "Admins can select all employees" ON employees
  FOR SELECT
  USING (public.is_admin());

-- 3. Administradores podem atualizar os dados dos colaboradores (como Home Office)
CREATE POLICY "Admins can update all employees" ON employees
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

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
  WITH CHECK (
    clerk_id = public.clerk_user_id() AND
    EXISTS (
      SELECT 1 FROM time_records
      WHERE id = time_record_id AND clerk_id = public.clerk_user_id()
    )
  );

CREATE POLICY "Admins can select all photos" ON employee_photos
  FOR SELECT
  USING (public.is_admin());

-- =======================================================
-- 4. CONFIGURAÇÃO DE SUPABASE STORAGE (BUCKETS & POLICIES)
-- =======================================================

-- Criar o bucket de fotos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-photos', 'employee-photos', true)
ON CONFLICT (id) DO NOTHING;


-- Política de upload (apenas colaboradores autenticados na própria pasta)
CREATE POLICY "Allow employees to upload photos" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'employee-photos' AND
    (storage.foldername(name))[1] = public.clerk_user_id()
  );

-- Política de leitura (apenas administradores podem visualizar fotos)
CREATE POLICY "Allow admins to read photos" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'employee-photos' AND
    public.is_admin()
  );

