import React from 'react';
import { VALUES } from '../constants';
import RevealOnScroll from './RevealOnScroll';

const Features: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          <RevealOnScroll className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-ocean-100 relative z-10">
              <img 
                src="https://gifdb.com/images/high/accounting-aesthetic-anime-4xwumjdnvlpre5jn.webp" 
                alt="Business meeting" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-ocean-900/20 mix-blend-multiply"></div>
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-ocean-200 rounded-2xl z-0 hidden md:block"></div>
          </RevealOnScroll>

          <div>
            <RevealOnScroll delay={200}>
              <h2 className="text-ocean-600 font-semibold tracking-wide uppercase mb-2">Nossa História</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-ocean-950 mb-6">
                Desde 2008, referência em inteligência contábil e empresarial.
              </h3>
              <div className="text-slate-600 mb-8 leading-relaxed space-y-4">
                <p>
                  Fundada em 2008, a <strong>Audifor Consultores e Associados</strong> (CNPJ 10.274.661/0001-69) construiu uma reputação de solidez e confiança no mercado mato-grossense. Sediada estrategicamente em Cuiabá, nossa organização evoluiu para se tornar um centro completo de soluções empresariais, atendendo com excelência as demandas complexas do cenário tributário brasileiro.
                </p>
                <p>
                  Combinamos mais de 15 anos de experiência com as mais modernas práticas de <em>compliance</em> e governança corporativa. Nosso foco vai muito além da burocracia tradicional: trabalhamos para garantir a saúde financeira e a segurança jurídica de nossos clientes, atuando com rigor técnico nas esferas Fiscal, Contábil, Trabalhista e Societária para transformar dados em estratégias de crescimento.
                </p>
              </div>
            </RevealOnScroll>

            <div className="space-y-6">
              {VALUES.map((value, index) => (
                <RevealOnScroll key={index} delay={300 + (index * 100)}>
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-ocean-50 flex items-center justify-center text-ocean-600">
                      <value.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-ocean-900 mb-1">{value.title}</h4>
                      <p className="text-sm text-slate-600">{value.description}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;