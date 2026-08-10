-- =======================================================================
-- MIGRATION SCRIPT - AUDITORIA DE SEGURANÇA E REGRAS DE NEGÓCIO NO BANCO
-- =======================================================================
-- Este script adiciona triggers e funções para calcular a distância do ponto
-- no servidor e impedir manipulação de localização e data/hora.
-- Cole este script no painel SQL EDITOR do seu console do Supabase e execute.
-- =======================================================================

-- 1. LIMPEZA DE ESTRUTURAS ANTERIORES (Caso existam)
DROP TRIGGER IF EXISTS trg_processar_time_record ON time_records;
DROP FUNCTION IF EXISTS public.processar_time_record();
DROP FUNCTION IF EXISTS public.calcular_distancia_metros(double precision, double precision, double precision, double precision);
DROP POLICY IF EXISTS "Employees can insert their own photos" ON employee_photos;

-- 2. CRIAÇÃO DA FUNÇÃO HAUSENS/HAVERSINE PARA CÁLCULO DE DISTÂNCIA
-- Calcula a distância em metros entre duas coordenadas geográficas.
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

-- 3. CRIAÇÃO DA FUNÇÃO DO TRIGGER DE VALIDAÇÃO E DATA/HORA
-- Força recorded_at = NOW() e calcula a distância no banco de dados.
CREATE OR REPLACE FUNCTION public.processar_time_record()
RETURNS TRIGGER AS $$
DECLARE
  v_allow_home_office boolean;
  v_distancia double precision;
  v_raio_permitido double precision := 100.0;     -- Limite de 100 metros
  v_lat_escritorio double precision := -15.5840;  -- Latitude do escritório
  v_lon_escritorio double precision := -56.0720;  -- Longitude do escritório
BEGIN
  -- SEGURANÇA: Força o horário do servidor (evita retroação ou data futura no cliente)
  NEW.recorded_at := NOW();

  -- SEGURANÇA: Obtém dados do colaborador diretamente do banco
  SELECT allow_home_office INTO v_allow_home_office
  FROM employees
  WHERE clerk_id = NEW.clerk_id;

  IF v_allow_home_office IS NULL THEN
    RAISE EXCEPTION 'Colaborador com clerk_id % não cadastrado no banco de dados.', NEW.clerk_id;
  END IF;

  -- SEGURANÇA: Se o funcionário estiver em Home Office, a geocerca é ignorada
  IF v_allow_home_office THEN
    NEW.distance_meters := 0;
    NEW.is_valid := true;
  ELSE
    -- SEGURANÇA: Calcula a distância baseada na fórmula Haversine no servidor
    v_distancia := public.calcular_distancia_metros(
      NEW.latitude,
      NEW.longitude,
      v_lat_escritorio,
      v_lon_escritorio
    );
    
    NEW.distance_meters := v_distancia;
    NEW.is_valid := (v_distancia <= v_raio_permitido);

    -- SEGURANÇA: Rejeita a inserção caso o colaborador esteja fora da geocerca
    IF NOT NEW.is_valid THEN
      RAISE EXCEPTION 'Acesso Negado: Registro de ponto bloqueado. Você está a % metros de distância, o que fica fora do limite de % metros.',
        round(v_distancia::numeric),
        round(v_raio_permitido::numeric);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. VINCULAÇÃO DO TRIGGER NA TABELA TIME_RECORDS
CREATE TRIGGER trg_processar_time_record
  BEFORE INSERT ON time_records
  FOR EACH ROW
  EXECUTE FUNCTION public.processar_time_record();

-- 5. CORREÇÃO DA VULNERABILIDADE DE IDOR EM EMPLOYEE_PHOTOS
-- Garante que o colaborador só consiga anexar fotos a registros de ponto dele mesmo.
CREATE POLICY "Employees can insert their own photos" ON employee_photos
  FOR INSERT
  WITH CHECK (
    clerk_id = public.clerk_user_id() AND
    EXISTS (
      SELECT 1 FROM time_records
      WHERE id = time_record_id AND clerk_id = public.clerk_user_id()
    )
  );

-- =======================================================================
-- FIM DO SCRIPT DE MIGRAÇÃO
-- =======================================================================
