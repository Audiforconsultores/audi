-- =======================================================================
-- MIGRATION SCRIPT - ATUALIZAÇÃO DAS COORDENADAS DO ESCRITÓRIO (GEOFENCING)
-- =======================================================================
-- Este script atualiza as coordenadas de geofencing na função do trigger
-- para corresponder ao endereço real no Jardim Califórnia (-15.62964, -56.07198).
-- Cole este script no painel SQL EDITOR do seu console do Supabase e execute.
-- =======================================================================

-- 1. DROP DO TRIGGER ANTERIOR PARA ATUALIZAÇÃO LIMPA
DROP TRIGGER IF EXISTS trg_processar_time_record ON time_records;

-- 2. CRIAÇÃO DA FUNÇÃO DO TRIGGER COM AS COORDENADAS ATUALIZADAS
CREATE OR REPLACE FUNCTION public.processar_time_record()
RETURNS TRIGGER AS $$
DECLARE
  v_allow_home_office boolean;
  v_is_active boolean;
  v_distancia double precision;
  v_raio_permitido double precision := 100.0;     -- Limite de 100 metros
  v_lat_escritorio double precision := -15.62964;  -- Latitude real do escritório (Jardim Califórnia)
  v_lon_escritorio double precision := -56.07198;  -- Longitude real do escritório (Jardim Califórnia)
BEGIN
  -- FORÇA HORÁRIO DO SERVIDOR
  NEW.recorded_at := NOW();

  -- OBTÉM DADOS DO COLABORADOR
  SELECT allow_home_office, is_active INTO v_allow_home_office, v_is_active
  FROM employees
  WHERE clerk_id = NEW.clerk_id;

  -- REJEITA SE O COLABORADOR FOR INATIVO OU NÃO EXISTIR
  IF v_is_active IS NULL OR NOT v_is_active THEN
    RAISE EXCEPTION 'Acesso Negado: Colaborador inativo ou não cadastrado no sistema.';
  END IF;

  -- SE ESTIVER EM HOME OFFICE, BYPASS NA GEOCERCA
  IF v_allow_home_office THEN
    NEW.distance_meters := 0;
    NEW.is_valid := true;
  ELSE
    -- CALCULA DISTÂNCIA USANDO HAVERSINE
    v_distancia := public.calcular_distancia_metros(
      NEW.latitude,
      NEW.longitude,
      v_lat_escritorio,
      v_lon_escritorio
    );
    
    NEW.distance_meters := v_distancia;
    NEW.is_valid := (v_distancia <= v_raio_permitido);

    -- REJEITA INSERÇÃO FORA DO RAIO
    IF NOT NEW.is_valid THEN
      RAISE EXCEPTION 'Acesso Negado: Registro de ponto bloqueado. Você está a % metros de distância, o que fica fora do limite de % metros.',
        round(v_distancia::numeric),
        round(v_raio_permitido::numeric);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RECRIANDO O TRIGGER VINCULADO
CREATE TRIGGER trg_processar_time_record
  BEFORE INSERT ON time_records
  FOR EACH ROW
  EXECUTE FUNCTION public.processar_time_record();

-- =======================================================================
-- FIM DO SCRIPT DE ATUALIZAÇÃO
-- =======================================================================
