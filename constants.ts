import { Calculator, FileText, Users, Building2, BarChart3, ShieldCheck, Banknote } from 'lucide-react';

export const COMPANY_INFO = {
  name: "Audifor Consultores e Associados",
  cnpj: "10.274.661/0001-69",
  location: "Cuiabá - MT", // Inferred from DDD 65
  address: "Consulte nosso endereço comercial oficial",
  description: "Análise de dados com transparência, economia e compliance governamental.",
  reception_email: "recepcao@audifor.com.br"
};

export const CONTACTS = {
  fiscal: {
    phone: "+55 65 98468-6793",
    email: "fiscal01@audifor.com.br",
    label: "Fiscal"
  },
  contabil: {
    phone: "+55 65 98174-0271",
    email: "contabil01@audifor.com.br", // Corrected typo from prompt 'contbail'
    label: "Contábil / Financeiro"
  },
  societario: {
    phone: "+55 65 98421-0455",
    email: "expediente01@audifor.com.br",
    label: "Societário"
  },
  dp: {
    phone: "+55 65 99264-0149",
    email: "dp01@audifor.com.br",
    label: "Departamento Pessoal"
  },
  financeiro_email_only: {
    email: "financeiro@audifor.com.br" // Corrected typo from prompt 'auidifor'
  }
};

export const SERVICES = [
  {
    title: "Fiscal & Tributário",
    description: "Gestão completa de obrigações fiscais, garantindo conformidade e buscando oportunidades legais de economia tributária.",
    icon: Calculator,
  },
  {
    title: "Contábil & Financeiro",
    description: "Análise patrimonial e financeira detalhada para embasar suas tomadas de decisão com dados precisos e transparentes.",
    icon: BarChart3,
  },
  {
    title: "Societário",
    description: "Abertura, alteração e encerramento de empresas, além de gestão de certidões e regularização junto aos órgãos públicos.",
    icon: Building2,
  },
  {
    title: "Departamento Pessoal",
    description: "Administração de rotinas trabalhistas, folha de pagamento e eSocial, minimizando riscos trabalhistas.",
    icon: Users,
  }
];

export const VALUES = [
  {
    title: "Transparência",
    description: "Clareza absoluta em todos os processos e demonstrações contábeis.",
    icon: FileText
  },
  {
    title: "Compliance",
    description: "Rigoroso cumprimento das leis governamentais e normas reguladoras.",
    icon: ShieldCheck
  },
  {
    title: "Economia",
    description: "Estratégias inteligentes para redução de custos e otimização fiscal.",
    icon: Banknote
  }
];