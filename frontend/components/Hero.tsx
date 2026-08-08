import React from 'react';
import { BookOpen } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const Hero: React.FC = () => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-36 md:pt-56 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/1920/1080?grayscale" 
          alt="Office background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-50 via-ocean-100/80 to-ocean-200/50 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        
        <RevealOnScroll>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-ocean-900 mb-6 leading-tight tracking-tight">
            Consultoria Contábil com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-600 to-ocean-800">
              Inteligência e Transparência
            </span>
          </h1>
        </RevealOnScroll>
        
        <RevealOnScroll delay={200}>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ajudamos sua empresa a organizar documentos, garantir compliance fiscal e encontrar oportunidades reais de economia. Sua segurança jurídica é nosso compromisso.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={400}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#reforma-tributaria"
              onClick={(e) => handleScroll(e, 'reforma-tributaria')}
              className="group relative px-8 py-4 bg-ocean-800 text-white rounded-lg font-semibold shadow-xl shadow-ocean-900/20 hover:bg-ocean-900 transition-all hover:-translate-y-1 flex items-center gap-2 cursor-pointer"
            >
              Reforma Tributária
              <BookOpen className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#services"
              onClick={(e) => handleScroll(e, 'services')}
              className="px-8 py-4 bg-white text-ocean-800 border border-ocean-200 rounded-lg font-semibold hover:bg-ocean-50 transition-colors cursor-pointer"
            >
              Conhecer Serviços
            </a>
          </div>
        </RevealOnScroll>
      </div>

      {/* Abstract Shapes */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-ocean-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-ocean-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    </section>
  );
};

export default Hero;