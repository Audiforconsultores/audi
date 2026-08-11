-- =======================================================================
-- MIGRATION SCRIPT - ATUALIZAÇÃO DA VALIDAÇÃO DE COLABORADOR ATIVO
-- =======================================================================
-- Este script atualiza o trigger de ponto para verificar se o colaborador
-- está com a coluna 'is_active = true' antes de permitir a batida de ponto.
-- Cole este script no painel SQL EDITOR do seu console do Supabase e execute.
-- =======================================================================

-- 1. DROP DAS ESTRUTURAS ANTERIORES PARA ATUALIZAÇÃO LIMPA
DROP TRIGGER IF EXISTS trg_processar_time_record ON time_records;

-- 2. CRIAÇÃO DA FUNÇÃO ATUALIZADA DO TRIGGER
CREATE OR REPLACE FUNCTION public.processar_time_record()
RETURNS TRIGGER AS $$
DECLARE
  v_allow_home_office boolean;
  v_is_active boolean;
  v_distancia double precision;
  v_raio_permitido double precision := 100.0;     -- Limite de 100 metros
  v_lat_escritorio double precision := -15.5840;  -- Latitude do escritório
  v_lon_escritorio double precision := -56.0720;  -- Longitude do escritório
BEGIN
  -- SEGURANÇA: Força o horário do servidor (evita retroação ou data futura no cliente)
  NEW.recorded_at := NOW();

  -- SEGURANÇA: Obtém dados e status de atividade do colaborador
  SELECT allow_home_office, is_active INTO v_allow_home_office, v_is_active
  FROM employees
  WHERE clerk_id = NEW.clerk_id;

  -- SEGURANÇA: Rejeita se o colaborador for inativo ou não existir
  IF v_is_active IS NULL OR NOT v_is_active THEN
    RAISE EXCEPTION 'Acesso Negado: Colaborador inativo ou não cadastrado no sistema.';
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

-- 3. RECRIANDO O TRIGGER VINCULADO
CREATE TRIGGER trg_processar_time_record
  BEFORE INSERT ON time_records
  FOR EACH ROW
  EXECUTE FUNCTION public.processar_time_record();
