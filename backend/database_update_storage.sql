-- =======================================================================
-- MIGRATION SCRIPT - CRIAÇÃO DO BUCKET DE STORAGE E POLÍTICAS DE RLS
-- =======================================================================
-- Este script cria o bucket 'employee-photos' no Supabase Storage e 
-- estabelece regras restritas de acesso (RLS) para inserção e leitura de fotos.
-- Cole este script no painel SQL EDITOR do seu console do Supabase e execute.
-- =======================================================================

-- 1. CRIAÇÃO DO BUCKET DE FOTOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-photos', 'employee-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. LIMPEZA DE POLÍTICAS ANTERIORES DO BUCKET (Caso existam)
DROP POLICY IF EXISTS "Allow employees to upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to read photos" ON storage.objects;

-- 4. CRIAÇÃO DE POLÍTICA DE UPLOAD (INSERT)
-- Permite que colaboradores autenticados façam upload apenas de suas próprias fotos.
-- O primeiro nível de pastas do arquivo DEVE obrigatoriamente ser o Clerk ID do usuário.
CREATE POLICY "Allow employees to upload photos" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'employee-photos' AND
    (storage.foldername(name))[1] = public.clerk_user_id()
  );

-- 5. CRIAÇÃO DE POLÍTICA DE LEITURA (SELECT)
-- Permite que apenas administradores do sistema leiam as fotos do bucket.
CREATE POLICY "Allow admins to read photos" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'employee-photos' AND
    public.is_admin()
  );

-- =======================================================================
-- FIM DO SCRIPT DE MIGRAÇÃO DE STORAGE
-- =======================================================================
