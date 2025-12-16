import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#home' },
    { name: 'Sobre', href: '#about' },
    { name: 'Serviços', href: '#services' },
    { name: 'Contato', href: '#contact' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Opcional: Atualizar a URL sem pular a página
      window.history.pushState(null, '', href);
    }
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-ocean-900/80 backdrop-blur-md shadow-lg py-2' // Menor padding e mais transparência (80%)
          : 'bg-transparent py-6' // Maior espaçamento inicial
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <img 
            src="https://i.imgur.com/Yk1zAk3.png" 
            alt="Audifor Consultores" 
            className={`w-auto object-contain transition-all duration-500 ease-in-out hover:scale-105 hover:drop-shadow-lg ${
              isScrolled 
                ? 'h-[50px] md:h-[60px] brightness-0 invert' // Logo reduzida drasticamente ao rolar
                : 'h-[110px] md:h-[160px]' // Logo grande no topo
            }`}
          />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className={`font-medium text-sm uppercase tracking-wide transition-colors cursor-pointer ${
                isScrolled 
                  ? 'text-ocean-100 hover:text-white' 
                  : 'text-ocean-800 hover:text-ocean-600'
              }`}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#fale-conosco"
            onClick={(e) => handleScrollTo(e, '#fale-conosco')}
            className={`px-5 py-2 rounded-full font-semibold transition-all transform hover:scale-105 cursor-pointer ${
              isScrolled
                ? 'bg-white text-ocean-900 hover:bg-ocean-100'
                : 'bg-ocean-800 text-white hover:bg-ocean-900 shadow-xl shadow-ocean-800/20'
            }`}
          >
            Fale Conosco
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-ocean-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className={isScrolled ? 'text-white' : 'text-ocean-900'} />
          ) : (
            <Menu className={isScrolled ? 'text-white' : 'text-ocean-900'} />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-ocean-900/90 backdrop-blur-md border-t border-ocean-800 shadow-xl transition-all">
          <div className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-ocean-100 hover:text-white py-3 block text-center font-medium text-lg border-b border-ocean-800/50 last:border-0 cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <a
              href="#fale-conosco"
              onClick={(e) => handleScrollTo(e, '#fale-conosco')}
              className="bg-ocean-100 text-ocean-900 py-3 rounded-lg font-bold text-center hover:bg-white transition-colors shadow-lg mt-2"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;