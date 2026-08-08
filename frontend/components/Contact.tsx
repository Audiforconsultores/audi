import React, { useState } from 'react';
import { CONTACTS, COMPANY_INFO } from '../constants';
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const Contact: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const getWhatsAppUrl = (phone: string | undefined) => {
    if (!phone) return '#';
    const cleanNumber = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // Simulação de envio para servidor (API)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2 segundos
      
      // Sucesso simulado
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      // Remove a mensagem de sucesso após 5 segundos para permitir novo envio
      setTimeout(() => {
        setStatus('idle');
      }, 5000);

    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="fale-conosco" className="py-24 bg-ocean-50 scroll-mt-24">
      <div className="container mx-auto px-4">
        
        <RevealOnScroll>
          <div className="text-center mb-16">
            <h2 className="text-ocean-600 font-semibold tracking-wide uppercase mb-2">Fale Conosco</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-ocean-950">
              Canais de Atendimento
            </h3>
            <p className="mt-4 text-slate-600">
              Envie uma mensagem ou entre em contato diretamente com o departamento responsável.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Form */}
          <RevealOnScroll className="lg:col-span-5">
            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-ocean-600 relative overflow-hidden">
              <h4 className="text-xl font-bold text-ocean-900 mb-2">Envie uma Mensagem</h4>
              <p className="text-slate-500 mb-6 text-sm">Receberemos sua solicitação imediatamente.</p>
              
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h5 className="text-xl font-bold text-ocean-900 mb-2">Mensagem Enviada!</h5>
                  <p className="text-slate-600">
                    Obrigado pelo contato. Nossa equipe retornará em breve pelo email ou telefone informado.
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-ocean-600 font-medium hover:underline text-sm"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-ocean-900 mb-1">Nome Completo</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={status === 'sending'}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-ocean-900 mb-1">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={status === 'sending'}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-ocean-900 mb-1">Telefone / WhatsApp</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={status === 'sending'}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                        placeholder="(65) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-ocean-900 mb-1">Assunto</label>
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject" 
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      disabled={status === 'sending'}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      placeholder="Assunto da mensagem"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-ocean-900 mb-1">Mensagem</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={status === 'sending'}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all resize-none disabled:bg-slate-50 disabled:text-slate-400"
                      placeholder="Como podemos ajudar?"
                    ></textarea>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>Houve um erro ao enviar. Por favor, tente novamente ou use o WhatsApp.</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full bg-ocean-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-ocean-900 disabled:bg-ocean-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group shadow-lg shadow-ocean-800/20"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Mensagem
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </RevealOnScroll>

          {/* Right Column: Info & Departments */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* General Info */}
            <RevealOnScroll delay={200}>
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex flex-col md:flex-row gap-8 justify-between">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-ocean-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-ocean-900">Localização</p>
                    <p className="text-slate-600 text-sm">{COMPANY_INFO.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-ocean-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-ocean-900">Horário</p>
                    <p className="text-slate-600 text-sm">Seg a Sex: 08h às 18h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-ocean-600 flex-shrink-0 mt-1" />
                  <div>
                     <p className="font-semibold text-ocean-900">Recepção</p>
                     <a href={`mailto:${COMPANY_INFO.reception_email}`} className="text-slate-600 text-sm hover:text-ocean-600">
                       {COMPANY_INFO.reception_email}
                     </a>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Department Grid */}
            <div id="contact" className="grid md:grid-cols-2 gap-6 scroll-mt-36 md:scroll-mt-48">
              {/* Fiscal */}
              <RevealOnScroll delay={300}>
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-100 h-full">
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-4">
                    {CONTACTS.fiscal.label}
                  </div>
                  <div className="space-y-3">
                    <a 
                      href={getWhatsAppUrl(CONTACTS.fiscal.phone)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium text-sm">{CONTACTS.fiscal.phone}</span>
                    </a>
                    <a href={`mailto:${CONTACTS.fiscal.email}`} className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm break-all">{CONTACTS.fiscal.email}</span>
                    </a>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Contábil */}
              <RevealOnScroll delay={400}>
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-100 h-full">
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold mb-4">
                    {CONTACTS.contabil.label}
                  </div>
                  <div className="space-y-3">
                    <a 
                      href={getWhatsAppUrl(CONTACTS.contabil.phone)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium text-sm">{CONTACTS.contabil.phone}</span>
                    </a>
                    <a href={`mailto:${CONTACTS.contabil.email}`} className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm break-all">{CONTACTS.contabil.email}</span>
                    </a>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Societário */}
              <RevealOnScroll delay={500}>
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-100 h-full">
                  <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold mb-4">
                    {CONTACTS.societario.label}
                  </div>
                  <div className="space-y-3">
                    <a 
                      href={getWhatsAppUrl(CONTACTS.societario.phone)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium text-sm">{CONTACTS.societario.phone}</span>
                    </a>
                    <a href={`mailto:${CONTACTS.societario.email}`} className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm break-all">{CONTACTS.societario.email}</span>
                    </a>
                  </div>
                </div>
              </RevealOnScroll>

              {/* DP */}
              <RevealOnScroll delay={600}>
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-100 h-full">
                  <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold mb-4">
                    {CONTACTS.dp.label}
                  </div>
                  <div className="space-y-3">
                    <a 
                      href={getWhatsAppUrl(CONTACTS.dp.phone)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium text-sm">{CONTACTS.dp.phone}</span>
                    </a>
                    <a href={`mailto:${CONTACTS.dp.email}`} className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm break-all">{CONTACTS.dp.email}</span>
                    </a>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;