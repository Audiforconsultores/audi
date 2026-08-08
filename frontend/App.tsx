import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useClerk, useUser } from '@clerk/react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Services from './components/Services';
import TaxReform from './components/TaxReform';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AccountantArea from './components/AccountantArea';
import AdminArea from './components/AdminArea';

const App: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const [currentView, setCurrentView] = useState<'home' | 'accountant' | 'admin'>('home');
  const inicializadoRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!inicializadoRef.current) {
      inicializadoRef.current = true;
      if (isSignedIn) {
        const sessaoAtiva = sessionStorage.getItem('sessao_ativa');
        if (!sessaoAtiva) {
          clerk.signOut();
          setCurrentView('home');
          return;
        }
      } else {
        sessionStorage.setItem('sessao_ativa', 'true');
      }
    }

    if (isSignedIn) {
      const email = user?.primaryEmailAddress?.emailAddress || '';
      if (email && !email.endsWith('@audifor.com.br')) {
        alert('Acesso negado: Apenas e-mails do domínio @audifor.com.br são permitidos para acessar a Área do Contador.');
        clerk.signOut();
        setCurrentView('home');
        return;
      }
      sessionStorage.setItem('sessao_ativa', 'true');
      if (!sessionStorage.getItem('sessao_inicio')) {
        sessionStorage.setItem('sessao_inicio', Date.now().toString());
      }
      setCurrentView('accountant');
    } else {
      sessionStorage.removeItem('sessao_inicio');
    }
  }, [isLoaded, isSignedIn, clerk, user]);

  useEffect(() => {
    if (!isSignedIn) return;

    // Não aplica timer de sessão para administradores
    const emailsAdmin = ['adm@audifor.com.br', 'controller@audifor.com.br'];
    const ehAdmin = emailsAdmin.includes(user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '');
    if (ehAdmin) return;

    const checarTempoSessao = () => {
      const inicio = sessionStorage.getItem('sessao_inicio');
      if (inicio) {
        const tempoDecorrido = Date.now() - Number(inicio);
        const limite = 7 * 60 * 1000; // 7 minutos
        if (tempoDecorrido >= limite) {
          alert('Sua sessão de 7 minutos expirou e você foi desconectado automaticamente por segurança.');
          clerk.signOut();
          setCurrentView('home');
        }
      }
    };

    checarTempoSessao();
    const intervalo = setInterval(checarTempoSessao, 5000);

    return () => clearInterval(intervalo);
  }, [isSignedIn, clerk, user]);

  if (currentView === 'accountant') {
    return (
      <AccountantArea 
        onBackToHome={() => setCurrentView('home')} 
        onGoToAdmin={() => setCurrentView('admin')}
      />
    );
  }

  if (currentView === 'admin') {
    return <AdminArea onBackToPortal={() => setCurrentView('accountant')} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <Header onOpenAccountantArea={() => setCurrentView('accountant')} />
      <main>
        <Hero />
        <Features />
        <Services />
        <TaxReform />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;