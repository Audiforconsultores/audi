-- =======================================================================
-- MIGRATION SCRIPT - PORTARIA 671 COMPLIANCE
-- =======================================================================
-- Este script adiciona as colunas necessárias na tabela 'employees' e 
-- 'time_records' para conformidade com a portaria 671, além de criar
-- o bucket 'ponto-recibos' no Supabase Storage com as políticas RLS.
-- =======================================================================

-- 1. ADICIONAR COLUNAS CPF E CARGO NA TABELA EMPLOYEES
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS cargo TEXT;

-- 2. ADICIONAR COLUNA RECEIPT_PATH NA TABELA TIME_RECORDS
ALTER TABLE time_records 
ADD COLUMN IF NOT EXISTS receipt_path TEXT;

-- 3. CRIAÇÃO DO BUCKET DE RECIBOS DE PONTO NO SUPABASE STORAGE
INSERT INTO storage.buckets (id, name, public)
VALUES ('ponto-recibos', 'ponto-recibos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. LIMPEZA DE POLÍTICAS ANTERIORES DO BUCKET (Caso existam)
DROP POLICY IF EXISTS "Allow employees to upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow employees to read their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to read all receipts" ON storage.objects;

-- 5. CRIAÇÃO DE POLÍTICA DE UPLOAD (INSERT)
-- Permite que colaboradores autenticados façam upload de recibos apenas em suas próprias pastas.
-- O primeiro nível de pastas do arquivo DEVE obrigatoriamente ser o Clerk ID do usuário.
CREATE POLICY "Allow employees to upload receipts" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ponto-recibos' AND
    (storage.foldername(name))[1] = public.clerk_user_id()
  );

-- 6. CRIAÇÃO DE POLÍTICA DE LEITURA (SELECT) DO FUNCIONÁRIO
-- Permite que colaboradores visualizem e façam download apenas de seus próprios recibos.
CREATE POLICY "Allow employees to read their own receipts" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ponto-recibos' AND
    (storage.foldername(name))[1] = public.clerk_user_id()
  );

-- 7. CRIAÇÃO DE POLÍTICA DE LEITURA (SELECT) DO ADMINISTRADOR
-- Permite que administradores tenham acesso a todos os recibos no bucket.
CREATE POLICY "Allow admins to read all receipts" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ponto-recibos' AND
    public.is_admin()
  );

-- =======================================================================
-- FIM DO SCRIPT DE MIGRAÇÃO DE PORTARIA 671
-- =======================================================================
