import React, { useState } from 'react';
import { useAuth, useUser, SignIn, SignUp, UserButton } from '@clerk/react';
import { 
  FileText, 
  Utensils, 
  Download, 
  Eye, 
  ExternalLink, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  FileCheck, 
  HelpCircle,
  X,
  Printer,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface AccountantAreaProps {
  onBackToHome: () => void;
}

const LUNCH_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScbyjT_dmxjjrid1w_619BrGoAlk9vmRLAz51W4W-RysyvzsQ/viewform';

export const AccountantArea: React.FC<AccountantAreaProps> = ({ onBackToHome }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'holerite' | 'almoco' | 'documentos'>('holerite');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Holerite States
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Mock data for holerites
  const holeriteHistory = [
    { id: '2026-07', label: 'Julho / 2026', liquido: 'R$ 5.707,50', bruto: 'R$ 6.850,00', status: 'Disponível', data: '05/07/2026' },
    { id: '2026-06', label: 'Junho / 2026', liquido: 'R$ 5.707,50', bruto: 'R$ 6.850,00', status: 'Pago', data: '05/06/2026' },
    { id: '2026-05', label: 'Maio / 2026', liquido: 'R$ 5.540,00', bruto: 'R$ 6.600,00', status: 'Pago', data: '05/05/2026' },
    { id: '2026-04', label: 'Abril / 2026', liquido: 'R$ 5.540,00', bruto: 'R$ 6.600,00', status: 'Pago', data: '05/04/2026' },
    { id: '2026-03', label: 'Março / 2026', liquido: 'R$ 5.540,00', bruto: 'R$ 6.600,00', status: 'Pago', data: '05/03/2026' },
  ];

  const currentHolerite = holeriteHistory.find(h => h.id === selectedMonth) || holeriteHistory[0];

  const handleDownloadPDF = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-ocean-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-ocean-300 text-sm font-semibold">Carregando área do contador...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-ocean-950 via-ocean-900 to-slate-900 text-white font-sans">
        {/* Header */}
        <header className="py-6 px-6 md:px-12 flex justify-between items-center border-b border-ocean-800/40 backdrop-blur-md bg-ocean-950/50">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToHome} 
              className="flex items-center gap-2 text-ocean-200 hover:text-white transition-colors text-sm font-medium bg-ocean-800/40 hover:bg-ocean-800/80 px-3.5 py-2 rounded-lg border border-ocean-700/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </button>
            <img 
              src="https://i.imgur.com/Yk1zAk3.png" 
              alt="Audifor Consultores" 
              className="h-10 md:h-12 object-contain brightness-0 invert ml-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-ocean-500/20 text-ocean-300 border border-ocean-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Autenticação Segura via Clerk
            </span>
          </div>
        </header>

        {/* Body Portal */}
        <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Info & Features */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-ocean-800/50 border border-ocean-700/60 px-4 py-1.5 rounded-full text-ocean-300 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-ocean-400" />
                Portal do Contador & Colaborador
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Bem-vindo à sua <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-300 via-cyan-200 to-white">
                  Área Exclusiva
                </span>
              </h1>

              <p className="text-ocean-200 text-base md:text-lg leading-relaxed">
                Acesse com facilidade seus demonstrativos de pagamento (holerites), solicite refeições diárias e faça a gestão simplificada de documentos.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-ocean-900/40 border border-ocean-800/60">
                  <div className="p-2.5 rounded-lg bg-ocean-500/20 text-ocean-300 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Holerite Digital Simplificado</h4>
                    <p className="text-xs text-ocean-300 mt-0.5">Consulte e baixe demonstrativos de pagamento de qualquer mês instantaneamente.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-ocean-900/40 border border-ocean-800/60">
                  <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Pedido de Almoço Integrado</h4>
                    <p className="text-xs text-ocean-300 mt-0.5">Faça o seu pedido de almoço diário em um clique diretamente no formulário oficial.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-ocean-900/40 border border-ocean-800/60">
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Segurança e Privacidade</h4>
                    <p className="text-xs text-ocean-300 mt-0.5">Autenticação gerenciada pelo Clerk com criptografia de ponta a ponta.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Clerk Auth Card */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="w-full max-w-md bg-ocean-900/80 backdrop-blur-xl border border-ocean-700/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-ocean-950/80">
                <div className="flex items-center justify-between border-b border-ocean-800 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAuthMode('signin')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        authMode === 'signin'
                          ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-600/30'
                          : 'text-ocean-300 hover:text-white hover:bg-ocean-800/50'
                      }`}
                    >
                      Entrar na Conta
                    </button>
                    <button
                      onClick={() => setAuthMode('signup')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        authMode === 'signup'
                          ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-600/30'
                          : 'text-ocean-300 hover:text-white hover:bg-ocean-800/50'
                      }`}
                    >
                      Criar Conta
                    </button>
                  </div>
                </div>

                <div className="flex justify-center py-2">
                  {authMode === 'signin' ? (
                    <SignIn 
                      appearance={{
                        elements: {
                          rootBox: 'w-full',
                          card: 'shadow-none bg-transparent p-0 w-full',
                          headerTitle: 'text-white text-xl font-bold',
                          headerSubtitle: 'text-ocean-300 text-xs',
                          socialButtonsBlockButton: 'bg-ocean-800 text-white border-ocean-700 hover:bg-ocean-700',
                          formButtonPrimary: 'bg-ocean-600 hover:bg-ocean-500 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-ocean-600/30',
                          formFieldLabel: 'text-ocean-200 text-xs font-medium',
                          formFieldInput: 'bg-ocean-950/80 border-ocean-700 text-white rounded-xl text-sm focus:border-ocean-400 focus:ring-ocean-400',
                          footerActionLink: 'text-ocean-300 hover:text-white text-xs',
                          identityPreviewText: 'text-white',
                          formHeaderTitle: 'text-white',
                          formHeaderSubtitle: 'text-ocean-300',
                        }
                      }}
                    />
                  ) : (
                    <SignUp 
                      appearance={{
                        elements: {
                          rootBox: 'w-full',
                          card: 'shadow-none bg-transparent p-0 w-full',
                          headerTitle: 'text-white text-xl font-bold',
                          headerSubtitle: 'text-ocean-300 text-xs',
                          socialButtonsBlockButton: 'bg-ocean-800 text-white border-ocean-700 hover:bg-ocean-700',
                          formButtonPrimary: 'bg-ocean-600 hover:bg-ocean-500 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-ocean-600/30',
                          formFieldLabel: 'text-ocean-200 text-xs font-medium',
                          formFieldInput: 'bg-ocean-950/80 border-ocean-700 text-white rounded-xl text-sm focus:border-ocean-400 focus:ring-ocean-400',
                          footerActionLink: 'text-ocean-300 hover:text-white text-xs',
                          formHeaderTitle: 'text-white',
                          formHeaderSubtitle: 'text-ocean-300',
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navigation Header */}
        <header className="sticky top-0 z-40 bg-ocean-900 text-white shadow-lg border-b border-ocean-800">
          <div className="container mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">
            {/* Brand Logo & Back Button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={onBackToHome}
                className="flex items-center gap-1.5 text-xs text-ocean-200 hover:text-white bg-ocean-800/80 hover:bg-ocean-800 px-3 py-1.5 rounded-lg border border-ocean-700 transition-colors"
                title="Voltar para a Landing Page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Site Principal</span>
              </button>

              <div className="h-6 w-[1px] bg-ocean-700 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <img 
                  src="https://i.imgur.com/Yk1zAk3.png" 
                  alt="Audifor" 
                  className="h-8 md:h-9 object-contain brightness-0 invert" 
                />
                <span className="hidden md:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-ocean-700/60 text-ocean-200 border border-ocean-600/40">
                  Área do Contador
                </span>
              </div>
            </div>

            {/* Profile & Clerk UserButton */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none text-white">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.primaryEmailAddress?.emailAddress}
                </p>
                <p className="text-[11px] text-ocean-300 mt-0.5">Colaborador / Contador Audifor</p>
              </div>

              {/* Clerk User Button with Custom Styling */}
              <div className="p-0.5 bg-ocean-700/60 rounded-full border border-ocean-600/50">
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 border-2 border-ocean-400 shadow-sm'
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Greeting Section */}
        <section className="bg-gradient-to-r from-ocean-950 via-ocean-900 to-slate-900 text-white py-8 px-4 md:px-8 border-b border-ocean-800 shadow-inner">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Sessão Autenticada via Clerk
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                  Olá, {user?.firstName || 'Contador'}! 👋
                </h1>
                <p className="text-ocean-200 text-sm mt-1">
                  Painel de autoatendimento Audifor — consulte seu holerite e faça o pedido de almoço.
                </p>
              </div>

              {/* Action tabs */}
              <div className="flex items-center gap-2 bg-ocean-950/80 p-1.5 rounded-2xl border border-ocean-800/80">
                <button
                  onClick={() => setActiveTab('holerite')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    activeTab === 'holerite'
                      ? 'bg-ocean-600 text-white shadow-md shadow-ocean-600/40'
                      : 'text-ocean-300 hover:text-white hover:bg-ocean-900/60'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Holerite</span>
                </button>

                <button
                  onClick={() => setActiveTab('almoco')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    activeTab === 'almoco'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40'
                      : 'text-ocean-300 hover:text-white hover:bg-ocean-900/60'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span>Pedir Almoço</span>
                </button>

                <button
                  onClick={() => setActiveTab('documentos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    activeTab === 'documentos'
                      ? 'bg-ocean-600 text-white shadow-md shadow-ocean-600/40'
                      : 'text-ocean-300 hover:text-white hover:bg-ocean-900/60'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Documentos</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="container mx-auto max-w-6xl px-4 md:px-8 py-8">
          {downloadSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Download Iniciado!</h4>
                  <p className="text-xs text-emerald-700">O holerite de {currentHolerite.label} foi baixado com sucesso no seu dispositivo.</p>
                </div>
              </div>
              <button onClick={() => setDownloadSuccess(false)} className="text-emerald-600 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: HOLERITE */}
          {activeTab === 'holerite' && (
            <div className="space-y-8">
              {/* Header & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ocean-600" />
                    Demonstrativo de Pagamento (Holerite)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Consulte os proventos, descontos e o salário líquido referente ao mês selecionado.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-ocean-600" />
                    Mês de referência:
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                  >
                    {holeriteHistory.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cards Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Salário Bruto */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salário Bruto</p>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{currentHolerite.bruto}</h3>
                      <span className="inline-block mt-2 text-[11px] font-medium text-slate-500">Base contratual integral</span>
                    </div>
                    <div className="p-3 bg-ocean-50 rounded-xl text-ocean-600">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Descontos Totais */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Descontos</p>
                      <h3 className="text-2xl font-extrabold text-rose-600 mt-2">R$ 1.142,50</h3>
                      <span className="inline-block mt-2 text-[11px] font-medium text-rose-500">INSS, IRRF, VT e benefícios</span>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                      <CreditCard className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Salário Líquido */}
                <div className="bg-gradient-to-br from-ocean-900 to-ocean-950 text-white rounded-2xl p-6 border border-ocean-800 shadow-md relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-ocean-300 uppercase tracking-wider">Salário Líquido a Receber</p>
                      <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{currentHolerite.liquido}</h3>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Status: {currentHolerite.status} ({currentHolerite.data})</span>
                      </div>
                    </div>
                    <div className="p-3 bg-ocean-800/80 rounded-xl text-emerald-400 border border-ocean-700">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Detalhamento dos Lançamentos — {currentHolerite.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Razão Social: Audifor Consultores e Associados Ltda.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPreviewOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-ocean-50 text-ocean-700 hover:bg-ocean-100 font-semibold text-xs md:text-sm rounded-xl border border-ocean-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar Holerite
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold text-xs md:text-sm rounded-xl shadow-md shadow-ocean-600/30 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Baixar PDF
                    </button>
                  </div>
                </div>

                {/* Table of earnings/deductions */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-6">Código</th>
                        <th className="py-3.5 px-6">Descrição da Rubrica</th>
                        <th className="py-3.5 px-6">Referência</th>
                        <th className="py-3.5 px-6 text-right text-emerald-700">Proventos (R$)</th>
                        <th className="py-3.5 px-6 text-right text-rose-700">Descontos (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-3.5 px-6 font-mono text-slate-500">001</td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">SALÁRIO BASE CONTRATUAL</td>
                        <td className="py-3.5 px-6 text-slate-500">30 dias</td>
                        <td className="py-3.5 px-6 text-right text-emerald-700 font-bold">6.850,00</td>
                        <td className="py-3.5 px-6 text-right text-slate-400">-</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-6 font-mono text-slate-500">102</td>
                        <td className="py-3.5 px-6 text-slate-800">INSS RETIDO NA FONTE</td>
                        <td className="py-3.5 px-6 text-slate-500">14.00 %</td>
                        <td className="py-3.5 px-6 text-right text-slate-400">-</td>
                        <td className="py-3.5 px-6 text-right text-rose-600 font-bold">751,99</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-6 font-mono text-slate-500">105</td>
                        <td className="py-3.5 px-6 text-slate-800">IRRF DEPARTAMENTO PESSOAL</td>
                        <td className="py-3.5 px-6 text-slate-500">7.50 %</td>
                        <td className="py-3.5 px-6 text-right text-slate-400">-</td>
                        <td className="py-3.5 px-6 text-right text-rose-600 font-bold">240,51</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-6 font-mono text-slate-500">204</td>
                        <td className="py-3.5 px-6 text-slate-800">VALE TRANSPORTE (DESC. LEGAL)</td>
                        <td className="py-3.5 px-6 text-slate-500">6.00 %</td>
                        <td className="py-3.5 px-6 text-right text-slate-400">-</td>
                        <td className="py-3.5 px-6 text-right text-rose-600 font-bold">150,00</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={3} className="py-4 px-6 text-slate-800">TOTAIIS DOS LANÇAMENTOS</td>
                        <td className="py-4 px-6 text-right text-emerald-700 text-base">R$ 6.850,00</td>
                        <td className="py-4 px-6 text-right text-rose-600 text-base">R$ 1.142,50</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bases de cálculo */}
                <div className="bg-slate-100/70 p-4 px-6 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Base Cálculo FGTS</span>
                    <span className="font-semibold text-slate-800">R$ 6.850,00</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">FGTS do Mês (8%)</span>
                    <span className="font-semibold text-slate-800">R$ 548,00</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Base Cálculo IRRF</span>
                    <span className="font-semibold text-slate-800">R$ 6.098,01</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Faixa IRRF</span>
                    <span className="font-semibold text-slate-800">7,5%</span>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ocean-600" />
                  Histórico de Holerites Anteriores
                </h3>

                <div className="divide-y divide-slate-100">
                  {holeriteHistory.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-ocean-50 text-ocean-600 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{item.label}</h4>
                          <p className="text-xs text-slate-500">Disponibilizado em {item.data}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{item.liquido}</p>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {item.status}
                          </span>
                        </div>

                        <button 
                          onClick={() => { setSelectedMonth(item.id); setIsPreviewOpen(true); }}
                          className="p-2 text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                          title="Visualizar este holerite"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PEDIR ALMOÇO */}
          {activeTab === 'almoco' && (
            <div className="space-y-8">
              {/* Main Lunch Order Banner */}
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-amber-400/30">
                {/* Decorative Circles */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute right-20 top-0 w-32 h-32 bg-amber-300/20 rounded-full blur-xl pointer-events-none"></div>

                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30 mb-4 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></span>
                    <span>PEDIDOS ABERTOS DE HOJE (ATÉ ÀS 11:30)</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                    Solicitação do Almoço Diário
                  </h2>

                  <p className="mt-3 text-amber-100 text-sm md:text-base leading-relaxed">
                    Escolha a sua refeição para o dia de trabalho através do formulário oficial de almoço da Audifor. Clique no botão abaixo para abrir o formulário.
                  </p>

                  {/* DIRECT BUTTON TO GOOGLE FORM URL */}
                  <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <a
                      href={LUNCH_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-base md:text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all group"
                    >
                      <Utensils className="w-6 h-6 text-amber-600 group-hover:rotate-12 transition-transform" />
                      <span>Fazer Pedido de Almoço</span>
                      <ExternalLink className="w-5 h-5 text-amber-500" />
                    </a>

                    <div className="text-amber-100 text-xs flex items-center gap-1.5 justify-center sm:justify-start">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Abre diretamente no formulário do Google</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rules & Deadlines */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Horários e Regras de Pedido
                  </h3>

                  <ul className="space-y-3.5 text-xs md:text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      <div className="p-1.5 bg-amber-50 text-amber-700 rounded-md shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block">Horário Limite: 11:30</strong>
                        Pedidos enviados após este horário não serão processados no mesmo dia.
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="p-1.5 bg-amber-50 text-amber-700 rounded-md shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block">Restrições Alimentares</strong>
                        Informe no próprio formulário se possui alergias ou dietas especiais (vegetariana, sem glúten, etc.).
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="p-1.5 bg-amber-50 text-amber-700 rounded-md shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block">Entrega no Escritório</strong>
                        As refeições chegam por volta das 12:15 na copa do andar principal.
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Cardápio do Dia Mock/Preview */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-amber-600" />
                    Opções Disponíveis no Formulário
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Prato Principal 01</h4>
                        <p className="text-[11px] text-slate-500">Filé de Frango Grelhado, Arroz, Feijão e Salada</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">Tradicional</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Prato Principal 02</h4>
                        <p className="text-[11px] text-slate-500">Bife acebolado com Purê de Batatas e Legumes</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">Executivo</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Opção Vegetariana</h4>
                        <p className="text-[11px] text-slate-500">Omelete de Ervas Finas com Salada Orgânica e Quinoa</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">Fit / Veg</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                    <a
                      href={LUNCH_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 hover:underline"
                    >
                      Acessar formulário completo para fazer a escolha <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTOS & AJUDA */}
          {activeTab === 'documentos' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-ocean-600" />
                  Documentos & Declarações
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Documentos disponibilizados pelo Departamento Pessoal e Recursos Humanos da Audifor.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 hover:border-ocean-300 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-ocean-50 text-ocean-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Comprovante de Rendimentos (IRPF 2025/2026)</h4>
                      <p className="text-xs text-slate-500">Informe de rendimentos para declaração do imposto de renda.</p>
                    </div>
                  </div>
                  <button onClick={handleDownloadPDF} className="px-3 py-1.5 bg-ocean-600 text-white rounded-lg text-xs font-semibold hover:bg-ocean-700">
                    Baixar
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 hover:border-ocean-300 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-ocean-50 text-ocean-600 rounded-lg">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Política Interna e Benefícios</h4>
                      <p className="text-xs text-slate-500">Guia do colaborador Audifor e código de conduta.</p>
                    </div>
                  </div>
                  <button onClick={handleDownloadPDF} className="px-3 py-1.5 bg-ocean-600 text-white rounded-lg text-xs font-semibold hover:bg-ocean-700">
                    Baixar
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-ocean-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-800 block mb-0.5">Dúvidas sobre seu holerite ou cadastro?</strong>
                  Entre em contato diretamente com o Departamento Pessoal da Audifor pelo e-mail <a href="mailto:dp@audifor.com.br" className="text-ocean-600 underline font-semibold">dp@audifor.com.br</a> ou ramal interno 204.
                </div>
              </div>
            </div>
          )}
        </main>

        {/* MODAL: PREVIEW DO HOLERITE OFICIAL */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 text-slate-800">
              
              {/* Modal Header */}
              <div className="p-4 md:p-6 bg-ocean-900 text-white flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-ocean-300" />
                  <div>
                    <h3 className="font-bold text-base md:text-lg">Demonstrativo de Pagamento de Salário</h3>
                    <p className="text-xs text-ocean-200">Referência: {currentHolerite.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="p-2 text-ocean-200 hover:text-white hover:bg-ocean-800 rounded-lg transition-colors"
                    title="Imprimir Holerite"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setIsPreviewOpen(false)} 
                    className="p-2 text-ocean-200 hover:text-white hover:bg-ocean-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body - Official Payslip Mock Layout */}
              <div className="p-6 space-y-6 text-xs font-sans">
                {/* Employer & Employee Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-300 p-4 rounded-xl bg-slate-50">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Empregador</span>
                    <strong className="text-sm font-bold text-slate-900 block">AUDIFOR CONSULTORES E ASSOCIADOS LTDA.</strong>
                    <span className="text-slate-600 block">CNPJ: 12.345.678/0001-90</span>
                    <span className="text-slate-600 block">Endereço: Av. Paulista, 1000 - São Paulo/SP</span>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-slate-300 pt-2 md:pt-0 md:pl-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Trabalhador / Colaborador</span>
                    <strong className="text-sm font-bold text-slate-900 block">
                      {user?.fullName || user?.firstName || 'CONTADOR / COLABORADOR AUDIFOR'}
                    </strong>
                    <span className="text-slate-600 block">CPF: ***.456.789-** | CBO: 2522-10</span>
                    <span className="text-slate-600 block">Cargo: Contador Sênior / Consultor</span>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] border-b border-slate-300 uppercase">
                      <tr>
                        <th className="p-2.5">Cód</th>
                        <th className="p-2.5">Descrição</th>
                        <th className="p-2.5">Ref.</th>
                        <th className="p-2.5 text-right">Vencimentos</th>
                        <th className="p-2.5 text-right">Descontos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-mono">001</td>
                        <td className="p-2.5 font-bold">SALÁRIO BASE</td>
                        <td className="p-2.5">30d</td>
                        <td className="p-2.5 text-right font-bold text-emerald-700">R$ 6.850,00</td>
                        <td className="p-2.5 text-right text-slate-400">-</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono">102</td>
                        <td className="p-2.5">INSS RETIDO NA FONTE</td>
                        <td className="p-2.5">14%</td>
                        <td className="p-2.5 text-right text-slate-400">-</td>
                        <td className="p-2.5 text-right font-bold text-rose-600">R$ 751,99</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono">105</td>
                        <td className="p-2.5">IRRF DEPARTAMENTO PESSOAL</td>
                        <td className="p-2.5">7.5%</td>
                        <td className="p-2.5 text-right text-slate-400">-</td>
                        <td className="p-2.5 text-right font-bold text-rose-600">R$ 240,51</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono">204</td>
                        <td className="p-2.5">VALE TRANSPORTE</td>
                        <td className="p-2.5">6%</td>
                        <td className="p-2.5 text-right text-slate-400">-</td>
                        <td className="p-2.5 text-right font-bold text-rose-600">R$ 150,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Totals */}
                <div className="grid grid-cols-3 gap-3 border border-slate-300 p-4 rounded-xl bg-slate-50 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Vencimentos</span>
                    <strong className="text-sm font-extrabold text-emerald-700">R$ 6.850,00</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Descontos</span>
                    <strong className="text-sm font-extrabold text-rose-600">R$ 1.142,50</strong>
                  </div>
                  <div className="bg-emerald-100/60 p-2 rounded-lg border border-emerald-300">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Valor Líquido</span>
                    <strong className="text-base font-black text-emerald-900">{currentHolerite.liquido}</strong>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Baixar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AccountantArea;
