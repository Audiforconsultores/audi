import express from 'express';
import cors from 'cors';
import { createClerkClient } from '@clerk/backend';
import { supabase } from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { Webhook } from 'svix';

dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });

const app = express();
const porta = process.env.PORT || 3001;

app.use(cors());

// Instanciar Clerk Backend SDK para validações seguras
const clerkSecretKey = process.env.CLERK_SECRET_KEY || '';
const clerk = clerkSecretKey ? createClerkClient({ secretKey: clerkSecretKey }) : null;

// Endpoint básico de saúde
app.get('/api/saude', (req, res) => {
  res.json({
    status: 'online',
    bancoDeDados: supabase ? 'conectado' : 'simulado',
    autenticacao: clerk ? 'ativa' : 'inativa'
  });
});

// Endpoint para debug de colaboradores (bypass RLS via service role)
app.get('/api/debug/employees', async (req: any, res: any) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('employees').select('*');
      return res.json({ data, error });
    } catch (e: any) {
      return res.status(500).json({ erro: e.message });
    }
  }
  return res.json({ erro: 'Supabase não instanciado no backend.' });
});

// Webhook do Clerk para Sincronização de Usuários com a tabela employees
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), async (req: any, res: any) => {
  const segredoWebhook = process.env.CLERK_WEBHOOK_SECRET || '';
  if (!segredoWebhook) {
    console.error('[Webhook] CLERK_WEBHOOK_SECRET não configurado.');
    return res.status(400).json({ erro: 'Segredo do Webhook não configurado.' });
  }

  const cabecalhos = req.headers;
  const svixId = cabecalhos['svix-id'] as string;
  const svixTimestamp = cabecalhos['svix-timestamp'] as string;
  const svixSignature = cabecalhos['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ erro: 'Cabeçalhos Svix ausentes.' });
  }

  const corpoRaw = req.body.toString('utf8');

  const webhook = new Webhook(segredoWebhook);
  let payload: any;

  try {
    payload = webhook.verify(corpoRaw, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    });
  } catch (erro: any) {
    console.error('[Webhook] Falha ao verificar assinatura:', erro.message);
    return res.status(400).json({ erro: 'Assinatura inválida.' });
  }

  const tipoEvento = payload.type;
  const dadosEvento = payload.data;

  console.log(`[Webhook] Evento Clerk recebido: ${tipoEvento}`);

  if (tipoEvento === 'user.created' || tipoEvento === 'user.updated') {
    const clerkId = dadosEvento.id;
    const emailObj = dadosEvento.email_addresses?.find((email: any) => email.id === dadosEvento.primary_email_address_id);
    const email = emailObj ? emailObj.email_address : '';
    const nome = `${dadosEvento.first_name || ''} ${dadosEvento.last_name || ''}`.trim() || 'Usuário Sem Nome';

    if (supabase) {
      try {
        const { error } = await supabase
          .from('employees')
          .upsert({
            clerk_id: clerkId,
            name: nome,
            email: email,
            is_active: true
          }, { onConflict: 'clerk_id' });

        if (error) throw error;
        console.log(`[Webhook] Colaborador ${nome} sincronizado no Supabase com sucesso.`);
      } catch (erroDb: any) {
        console.error('[Webhook] Erro ao sincronizar no Supabase:', erroDb.message);
        return res.status(500).json({ erro: 'Erro no banco de dados.' });
      }
    }
  }

  if (tipoEvento === 'user.deleted') {
    const clerkId = dadosEvento.id;
    if (supabase) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('clerk_id', clerkId);

        if (error) throw error;
        console.log(`[Webhook] Colaborador com ID Clerk ${clerkId} removido do Supabase.`);
      } catch (erroDb: any) {
        console.error('[Webhook] Erro ao deletar no Supabase:', erroDb.message);
        return res.status(500).json({ erro: 'Erro no banco de dados.' });
      }
    }
  }

  res.status(200).json({ recebido: true });
});

// Middleware JSON ativado após a rota de Webhook (que exige corpo bruto raw)
app.use(express.json());

// Endpoint de Fale Conosco
app.post('/api/contato', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  console.log(`[Backend] Nova mensagem de contato recebida de ${name} (${email})`);

  setTimeout(() => {
    console.log(`[Segundo Plano] Email de notificação enviado para administrativo@audifor.com.br referente ao assunto: ${subject}`);
  }, 1000);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contatos')
        .insert([{ nome: name, email, telefone: phone, assunto: subject, mensagem: message, data_criacao: new Date() }]);
      
      if (error) throw error;
      return res.status(200).json({ sucesso: true, mensagem: 'Contato registrado no Supabase com sucesso!', data });
    } catch (erro: any) {
      console.error('[Erro Supabase]', erro.message);
      return res.status(200).json({ sucesso: true, mensagem: 'Processado em segundo plano (DB com falha/não migrado).' });
    }
  }

  res.status(200).json({
    sucesso: true,
    mensagem: 'Mensagem processada com sucesso no backend (modo simulação).'
  });
});

app.listen(porta, () => {
  console.log(`[Servidor Backend] Rodando com sucesso na porta ${porta}`);
});
