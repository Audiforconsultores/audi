# Audifor Consultores - Backend

Esta pasta contém o backend e as funcionalidades que rodam em segundo plano e serviços de banco de dados para a Audifor Consultores.

## Funcionalidades e Estrutura
- **Express**: Servidor HTTP para rotas de API.
- **Supabase Client**: Serviço de integração com o banco de dados PostgreSQL.
- **Clerk Backend SDK**: Para validação e gerenciamento de autenticação segura no lado do servidor.
- **Segundo Plano (Simulado)**: Fluxos de envio de email ou logs de contato.

## Como rodar o Backend localmente
No diretório raiz do projeto:
```bash
pnpm --filter backend run dev
```
ou dentro da pasta `backend`:
```bash
pnpm run dev
```
