import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Services from './components/Services';
import TaxReform from './components/TaxReform';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <Header />
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