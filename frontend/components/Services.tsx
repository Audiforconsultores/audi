import React from 'react';
import { SERVICES } from '../constants';
import RevealOnScroll from './RevealOnScroll';

const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-ocean-950 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-ocean-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-ocean-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-ocean-300 font-semibold tracking-wide uppercase mb-3">Nossas Especialidades</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Soluções completas para a saúde financeira da sua empresa
            </h3>
            <p className="text-ocean-100/80">
              Atuamos em todas as frentes necessárias para manter seu negócio legalizado, organizado e lucrativo.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <RevealOnScroll key={index} delay={index * 100} className="h-full">
              <div 
                className="bg-ocean-900/50 backdrop-blur-sm border border-ocean-800 p-8 rounded-2xl hover:bg-ocean-800 hover:border-ocean-600 transition-all duration-300 group h-full"
              >
                <div className="w-14 h-14 bg-ocean-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-ocean-600 transition-colors">
                  <service.icon className="w-7 h-7 text-ocean-200 group-hover:text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-white">{service.title}</h4>
                <p className="text-sm text-ocean-200/70 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;