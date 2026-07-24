import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Services from './components/Services';
import TaxReform from './components/TaxReform';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AccountantArea from './components/AccountantArea';

const App: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'accountant'>('home');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setCurrentView('accountant');
    }
  }, [isLoaded, isSignedIn]);

  if (currentView === 'accountant') {
    return <AccountantArea onBackToHome={() => setCurrentView('home')} />;
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