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
import { obterSupabaseClient } from './supabase';

const App: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const [currentView, setCurrentView] = useState<'home' | 'accountant' | 'admin'>('home');
  const [ehAdmin, setEhAdmin] = useState(false);
  const inicializadoRef = useRef(false);

  // SEC-05: Buscar o status de admin diretamente do Supabase
  useEffect(() => {
    const verificarAdminStatus = async () => {
      if (!isSignedIn || !user?.id) {
        setEhAdmin(false);
        return;
      }
      try {
        const token = await clerk.session?.getToken({ template: 'supabase' });
        if (!token) return;
        const supabaseClient = obterSupabaseClient(token);
        const { data, error } = await supabaseClient
          .from('employees')
          .select('is_admin')
          .eq('clerk_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setEhAdmin(data.is_admin || false);
        }
      } catch (err) {
        console.error('Erro ao buscar status de administrador:', err);
      }
    };

    verificarAdminStatus();
  }, [isSignedIn, user, clerk]);

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
        alert('Acesso negado: Apenas e-mails corporativos autorizados são permitidos para acessar a Área do Contador.');
        clerk.signOut();
        setCurrentView('home');
        return;
      }
      sessionStorage.setItem('sessao_ativa', 'true');
      if (!sessionStorage.getItem('sessao_inicio')) {
        sessionStorage.setItem('sessao_inicio', Date.now().toString());
      }
      if (currentView === 'home') {
        setCurrentView('accountant');
      }
    } else {
      sessionStorage.removeItem('sessao_inicio');
    }
  }, [isLoaded, isSignedIn, clerk, user, currentView]);

  useEffect(() => {
    if (!isSignedIn) return;

    // Não aplica timer de sessão para administradores
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
  }, [isSignedIn, clerk, ehAdmin]);

  if (currentView === 'accountant') {
    return (
      <AccountantArea 
        onBackToHome={() => setCurrentView('home')} 
        onGoToAdmin={() => setCurrentView('admin')}
        isAdmin={ehAdmin}
      />
    );
  }

  if (currentView === 'admin') {
    // SEC-05: Segurança extra impedindo acesso à interface do admin se não for admin
    if (!ehAdmin) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-rose-500">Acesso Negado</h1>
          <p className="mt-2 text-slate-400">Você não tem permissão para acessar esta área.</p>
          <button 
            onClick={() => setCurrentView('accountant')} 
            className="mt-6 px-4 py-2 bg-ocean-600 hover:bg-ocean-500 text-white font-semibold rounded-lg transition-colors"
          >
            Voltar ao Portal
          </button>
        </div>
      );
    }
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