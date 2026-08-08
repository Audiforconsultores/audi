import React from 'react';
import { TrendingUp, Scale, AlertTriangle, ArrowRight, CalendarClock, Layers, Info, ShoppingBasket, Coins } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const TaxReform: React.FC = () => {
  return (
    <section id="reforma-tributaria" className="py-24 bg-slate-50 relative overflow-hidden">
      
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header da Seção */}
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Info className="w-4 h-4" />
              Fonte: Governo Federal & SEFAZ
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-ocean-950 mb-6">
              Reforma Tributária: O Guia 2026
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Baseado na Emenda Constitucional 132/2023, preparamos um resumo dos impactos imediatos e futuros para o seu negócio e para o cenário econômico de Mato Grosso e do Brasil.
            </p>
          </div>
        </RevealOnScroll>

        {/* Card Principal: O que muda? */}
        <RevealOnScroll delay={100}>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-12">
            <div className="bg-ocean-900 p-6 md:p-8 text-white">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Layers className="w-6 h-6 text-ocean-300" />
                O Novo Sistema: IVA Dual
              </h3>
              <p className="text-ocean-200 mt-2">
                O modelo brasileiro adota o Imposto sobre Valor Adicionado (IVA) Dual, substituindo cinco tributos atuais por dois, garantindo transparência e não cumulatividade.
              </p>
            </div>
            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-ocean-800 mb-3">CBS (Federal)</h4>
                <p className="text-sm text-slate-600 mb-4">Contribuição sobre Bens e Serviços.</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span>Substitui: <strong>PIS, COFINS e IPI</strong></li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-ocean-500 rounded-full"></span>Gestão: União Federal</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-ocean-800 mb-3">IBS (Estadual/Municipal)</h4>
                <p className="text-sm text-slate-600 mb-4">Imposto sobre Bens e Serviços.</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span>Substitui: <strong>ICMS e ISS</strong></li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-ocean-500 rounded-full"></span>Gestão: Conselho Federativo</li>
                </ul>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Cronograma 2026 */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <RevealOnScroll delay={200} className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 h-full">
              <div className="flex items-center gap-3 mb-6">
                <CalendarClock className="w-8 h-8 text-ocean-600" />
                <h3 className="text-xl font-bold text-ocean-900">O Ano de 2026: Fase de Testes</h3>
              </div>
              <p className="text-slate-600 mb-6">
                Segundo o Ministério da Fazenda, 2026 será o ano de "calibragem" do sistema. O objetivo é testar a arrecadação sem aumentar a carga tributária total.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-ocean-50 rounded-lg border-l-4 border-ocean-600">
                  <span className="font-bold text-2xl text-ocean-700">0,9%</span>
                  <div>
                    <h5 className="font-bold text-ocean-900">Alíquota CBS</h5>
                    <p className="text-sm text-slate-600">Cobrança federal teste, compensável com PIS/COFINS.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-ocean-50 rounded-lg border-l-4 border-ocean-400">
                  <span className="font-bold text-2xl text-ocean-700">0,1%</span>
                  <div>
                    <h5 className="font-bold text-ocean-900">Alíquota IBS</h5>
                    <p className="text-sm text-slate-600">Cobrança estadual/municipal teste, compensável com ICMS/ISS.</p>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={300}>
            <div className="bg-ocean-800 text-white p-8 rounded-2xl shadow-lg h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Impacto MT
                </h3>
                <p className="text-ocean-100 text-sm leading-relaxed mb-6">
                  Para Mato Grosso, estado fortemente produtor, a mudança principal é a <strong>cobrança no destino</strong> (onde o produto é consumido), e não mais na origem.
                </p>
                <p className="text-ocean-100 text-sm leading-relaxed">
                  Isso visa acabar com a "Guerra Fiscal". Haverá um Fundo de Compensação de Benefícios Fiscais para garantir que empresas instaladas no estado não percam competitividade durante a transição (2029-2032).
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-ocean-600">
                <span className="text-xs font-semibold tracking-wider uppercase text-ocean-300">Atenção</span>
                <p className="font-medium mt-1">Revise seus incentivos fiscais estaduais atuais.</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* Novidades Sociais: Cesta Básica e Cashback */}
        <RevealOnScroll delay={400}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBasket className="w-6 h-6 text-green-700" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Cesta Básica Nacional</h4>
              <p className="text-slate-600 text-sm">
                Criação de uma cesta básica nacional de alimentos com <strong>alíquota zero</strong> de IBS e CBS, visando garantir o acesso à alimentação e reduzir a inflação sobre itens essenciais.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Coins className="w-6 h-6 text-purple-700" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Cashback Tributário</h4>
              <p className="text-slate-600 text-sm">
                Mecanismo inédito de devolução de parte dos impostos pagos (IBS e CBS) para famílias de baixa renda, focando na justiça fiscal e redução das desigualdades, especialmente em contas de luz e gás.
              </p>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={500}>
          <div className="mt-12 text-center">
            <div className="inline-block bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl">
              <div className="flex items-center justify-center gap-2 mb-2 text-yellow-800 font-bold">
                <AlertTriangle className="w-5 h-5" />
                Prepare-se Agora
              </div>
              <p className="text-slate-700 text-sm">
                Apesar da vigência plena ser gradual (até 2033), a adequação de sistemas e precificação deve começar antes de 2026. A Audifor está pronta para realizar o planejamento tributário de transição da sua empresa.
              </p>
            </div>
            
            <div className="mt-8">
              <a 
                href="https://www.gov.br/fazenda/pt-br/acesso-a-informacao/acoes-e-programas/reforma-tributaria"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-ocean-600 text-white rounded-lg font-semibold hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-600/20"
              >
                Saiba mais
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
};

export default TaxReform;