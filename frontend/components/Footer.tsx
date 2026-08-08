import React from 'react';
import { COMPANY_INFO } from '../constants';
import { Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-ocean-950 text-ocean-200 py-12 border-t border-ocean-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">AUDIFOR</h2>
            <p className="text-sm max-w-xs opacity-80 mb-6">
              {COMPANY_INFO.description}
            </p>
            
            <div className="flex justify-center md:justify-start">
              <a 
                href="https://www.instagram.com/audifor_consultores/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-3 transition-colors hover:text-white"
              >
                <div className="p-2 rounded-lg bg-ocean-900 border border-ocean-800 group-hover:border-pink-500/50 group-hover:bg-gradient-to-tr group-hover:from-yellow-500 group-hover:via-pink-500 group-hover:to-purple-600 transition-all duration-300">
                  <Instagram className="w-5 h-5 text-ocean-200 group-hover:text-white" />
                </div>
                <span className="text-sm font-medium">Siga nosso Instagram</span>
              </a>
            </div>
          </div>

          <div className="text-center md:text-right">
             <p className="text-sm">CNPJ: {COMPANY_INFO.cnpj}</p>
             <p className="text-sm mt-1">&copy; {new Date().getFullYear()} Audifor Consultores e Associados.</p>
             <p className="text-xs mt-2 opacity-50">Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;