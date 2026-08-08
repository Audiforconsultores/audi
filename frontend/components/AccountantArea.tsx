import React, { useState, useEffect } from 'react';
import { useAuth, useUser, SignIn, SignUp, UserButton } from '@clerk/react';
import { obterSupabaseClient } from '../supabase';
import { 
  FileText, 
  Utensils, 
  Download, 
  Eye, 
  ExternalLink, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  FileCheck, 
  HelpCircle,
  X,
  Printer,
  Sparkles,
  UserCheck,
  Fingerprint,
  Check,
  Lock,
  Camera,
  RefreshCw,
  Video
} from 'lucide-react';

interface AccountantAreaProps {
  onBackToHome: () => void;
}

const LUNCH_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScbyjT_dmxjjrid1w_619BrGoAlk9vmRLAz51W4W-RysyvzsQ/viewform';

export const AccountantArea: React.FC<AccountantAreaProps> = ({ onBackToHome }) => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'holerite' | 'almoco' | 'ponto'>('holerite');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [tempoRestante, setTempoRestante] = useState<string>('07:00');
  const [pontoParaConfirmar, setPontoParaConfirmar] = useState<'Entrada' | 'Almoço' | 'Retorno' | 'Saída' | null>(null);
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);
  const [mostrandoCapturaFacial, setMostrandoCapturaFacial] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const iniciarCamera = async () => {
    setCameraAtiva(true);
    setFotoCapturada(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      alert('Erro ao acessar a câmera frontal. Certifique-se de dar permissões de câmera.');
      fecharCamera();
    }
  };

  const fecharCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraAtiva(false);
    setMostrandoCapturaFacial(false);
  };

  const capturarFoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setFotoCapturada(dataUrl);
        
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
        setCameraAtiva(false);
      }
    }
  };

  useEffect(() => {
    const atualizarTimer = () => {
      const inicio = sessionStorage.getItem('sessao_inicio');
      if (inicio) {
        const tempoDecorrido = Date.now() - Number(inicio);
        const limite = 7 * 60 * 1000;
        const restanteMs = Math.max(0, limite - tempoDecorrido);
        
        const minutos = Math.floor(restanteMs / 60000);
        const segundos = Math.floor((restanteMs % 60000) / 1000);
        
        const formatado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        setTempoRestante(formatado);
      }
    };

    atualizarTimer();
    const intervalo = setInterval(atualizarTimer, 1000);

    return () => clearInterval(intervalo);
  }, []);

  interface RegistroPonto {
    id: string;
    tipo: 'Entrada' | 'Almoço' | 'Retorno' | 'Saída';
    horario: string;
    dataRegistro: string;
    recordedAtRaw?: string;
  }

  const [horaAtual, setHoraAtual] = useState<string>('');
  const [dataAtual, setDataAtual] = useState<string>('');
  const [historicoPontos, setHistoricoPontos] = useState<RegistroPonto[]>([]);
  const [pontoSucesso, setPontoSucesso] = useState<string | null>(null);

  // Efeito para relógio em tempo real
  useEffect(() => {
    const atualizarRelogio = () => {
      const agora = new Date();
      const horas = agora.getHours().toString().padStart(2, '0');
      const minutos = agora.getMinutes().toString().padStart(2, '0');
      const segundos = agora.getSeconds().toString().padStart(2, '0');
      
      const dia = agora.getDate().toString().padStart(2, '0');
      const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
      const ano = agora.getFullYear();
      
      setHoraAtual(`${horas}:${minutos}:${segundos}`);
      setDataAtual(`${dia}/${mes}/${ano}`);
    };

    atualizarRelogio();
    const relogioIntervalo = setInterval(atualizarRelogio, 1000);
    return () => clearInterval(relogioIntervalo);
  }, []);

  const deTipoBancoParaTipoFrontend = (tipo: string): 'Entrada' | 'Almoço' | 'Retorno' | 'Saída' => {
    switch (tipo) {
      case 'entrada': return 'Entrada';
      case 'saida_almoco': return 'Almoço';
      case 'retorno_almoco': return 'Retorno';
      case 'saida': return 'Saída';
      default: return 'Entrada';
    }
  };

  const deTipoFrontendParaTipoBanco = (tipo: 'Entrada' | 'Almoço' | 'Retorno' | 'Saída'): string => {
    switch (tipo) {
      case 'Entrada': return 'entrada';
      case 'Almoço': return 'saida_almoco';
      case 'Retorno': return 'retorno_almoco';
      case 'Saída': return 'saida';
    }
  };

  const [carregandoPontos, setCarregandoPontos] = useState(false);

  // Efeito para carregar os registros de ponto do Supabase
  useEffect(() => {
    const buscarPontosDoDia = async () => {
      setCarregandoPontos(true);
      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) return;
        const supabaseClient = obterSupabaseClient(token);

        const { data, error } = await supabaseClient
          .from('time_records')
          .select('*')
          .order('recorded_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const pontosFormatados: RegistroPonto[] = data.map((item: any) => {
            const dataObjeto = new Date(item.recorded_at);
            const horas = dataObjeto.getHours().toString().padStart(2, '0');
            const minutos = dataObjeto.getMinutes().toString().padStart(2, '0');
            const segundos = dataObjeto.getSeconds().toString().padStart(2, '0');
            
            const dia = dataObjeto.getDate().toString().padStart(2, '0');
            const mes = (dataObjeto.getMonth() + 1).toString().padStart(2, '0');
            const ano = dataObjeto.getFullYear();

            return {
              id: item.id,
              tipo: deTipoBancoParaTipoFrontend(item.record_type),
              horario: `${horas}:${minutos}:${segundos}`,
              dataRegistro: `${dia}/${mes}/${ano}`,
              recordedAtRaw: item.recorded_at
            };
          });
          setHistoricoPontos(pontosFormatados);
        }
      } catch (erro) {
        console.error('Erro ao buscar pontos do dia no Supabase:', erro);
      } finally {
        setCarregandoPontos(false);
      }
    };

    if (isSignedIn && dataAtual) {
      buscarPontosDoDia();
    }
  }, [isSignedIn, dataAtual, pontoSucesso]);

  const LATITUDE_ESCRITORIO = -15.5840;
  const LONGITUDE_ESCRITORIO = -56.0720;
  const RAIO_PERMITIDO_METROS = 100; // 100 metros de tolerância

  const calcularDistanciaMetros = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Raio da Terra em metros
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distância em metros
  };

  const obterGeolocalizacao = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: 0, longitude: 0 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (posicao) => {
          resolve({
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude
          });
        },
        () => {
          resolve({ latitude: 0, longitude: 0 });
        }
      );
    });
  };

  const verificarBloqueioPonto = (tipo: 'Entrada' | 'Almoço' | 'Retorno' | 'Saída'): { bloqueado: boolean; motivo?: string } => {
    const jaTemEntrada = historicoPontos.some(p => p.tipo === 'Entrada' && p.dataRegistro === dataAtual);
    const jaTemAlmoco = historicoPontos.some(p => p.tipo === 'Almoço' && p.dataRegistro === dataAtual);
    const jaTemRetorno = historicoPontos.some(p => p.tipo === 'Retorno' && p.dataRegistro === dataAtual);
    const jaTemSaida = historicoPontos.some(p => p.tipo === 'Saída' && p.dataRegistro === dataAtual);

    switch (tipo) {
      case 'Entrada':
        if (jaTemEntrada) {
          return { bloqueado: true, motivo: 'Registrado hoje' };
        }
        return { bloqueado: false };
      case 'Almoço':
        if (jaTemAlmoco) {
          return { bloqueado: true, motivo: 'Registrado hoje' };
        }
        if (!jaTemEntrada) {
          return { bloqueado: true, motivo: 'Aguardando Entrada' };
        }
        return { bloqueado: false };
      case 'Retorno':
        if (jaTemRetorno) {
          return { bloqueado: true, motivo: 'Registrado hoje' };
        }
        if (!jaTemAlmoco) {
          return { bloqueado: true, motivo: 'Aguardando Almoço' };
        }
        return { bloqueado: false };
      case 'Saída':
        if (jaTemSaida) {
          return { bloqueado: true, motivo: 'Registrado hoje' };
        }
        if (!jaTemRetorno) {
          return { bloqueado: true, motivo: 'Aguardando Retorno' };
        }
        return { bloqueado: false };
    }
  };

  const renderizarBotaoPonto = (
    tipo: 'Entrada' | 'Almoço' | 'Retorno' | 'Saída',
    icone: React.ReactNode,
    classeEstiloAtivo: string
  ) => {
    const { bloqueado, motivo } = verificarBloqueioPonto(tipo);

    if (bloqueado) {
      return (
        <button
          disabled
          className="flex flex-col items-center justify-center gap-0.5 py-2 px-4 bg-emerald-950/20 text-emerald-300/40 border border-emerald-800/20 rounded-xl cursor-not-allowed opacity-60 text-xs md:text-sm font-bold w-full"
          title={`Você não pode registrar ${tipo} agora.`}
        >
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>{tipo}</span>
          </div>
          <span className="text-[9px] font-normal">{motivo || 'Indisponível'}</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => {
          if (tipo === 'Entrada') {
            setMostrandoCapturaFacial(true);
            setTimeout(iniciarCamera, 150);
          } else {
            setPontoParaConfirmar(tipo);
          }
        }}
        className={`flex items-center justify-center gap-2 py-3 px-4 font-bold rounded-xl shadow transition-all transform hover:-translate-y-0.5 w-full text-xs md:text-sm ${classeEstiloAtivo}`}
      >
        {icone}
        <span>{tipo}</span>
      </button>
    );
  };

  const executarBaterPonto = async (tipoRegistro: 'Entrada' | 'Almoço' | 'Retorno' | 'Saída') => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        alert('Erro de autenticação: Faça login novamente.');
        return;
      }
      const supabaseClient = obterSupabaseClient(token);
      const coordenadas = await obterGeolocalizacao();

      if (coordenadas.latitude === 0 && coordenadas.longitude === 0) {
        alert('Erro: É necessário permitir o acesso à localização para registrar o ponto.');
        return;
      }

      // Calcular a distância do escritório
      const distanciaCalculada = calcularDistanciaMetros(
        coordenadas.latitude,
        coordenadas.longitude,
        LATITUDE_ESCRITORIO,
        LONGITUDE_ESCRITORIO
      );

      const estaNoRaioPermitido = distanciaCalculada <= RAIO_PERMITIDO_METROS;

      if (!estaNoRaioPermitido) {
        alert(`Acesso Negado: Registro de ponto bloqueado. Você está a ${distanciaCalculada} metros de distância, o que fica FORA DO RAIO máximo permitido (limite de ${RAIO_PERMITIDO_METROS} metros) da empresa Audifor Consultores.`);
        return;
      }

      // Salva no banco de dados do Supabase
      const { error } = await supabaseClient
        .from('time_records')
        .insert([{
          clerk_id: user?.id,
          record_type: deTipoFrontendParaTipoBanco(tipoRegistro),
          latitude: coordenadas.latitude,
          longitude: coordenadas.longitude,
          distance_meters: distanciaCalculada,
          is_valid: true,
          photo_path: tipoRegistro === 'Entrada' ? fotoCapturada : null
        }]);

      if (error) throw error;

      setFotoCapturada(null);
      setPontoSucesso(`Ponto de ${tipoRegistro} registrado com sucesso! Você está a ${distanciaCalculada}m do escritório.`);
      
      setTimeout(() => {
        setPontoSucesso(null);
      }, 5000);

    } catch (erro: any) {
      console.error('Erro ao registrar ponto no Supabase:', erro);
      alert(`Erro ao registrar ponto: ${erro.message || 'Verifique suas permissões no Supabase.'}\nID do Usuário no Frontend: ${user?.id}`);
    }
  };

  // Holerite States
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Mock data for holerites
  const holeriteHistory = [
    { id: '2026-07', label: 'Julho / 2026', liquido: 'R$ 5.707,50', bruto: 'R$ 6.850,00', status: 'Disponível', data: '05/07/2026' },
    { id: '2026-06', label: 'Junho / 2026', liquido: 'R$ 5.707,50', bruto: 'R$ 6.850,00', status: 'Pago', data: '05/06/2026' },
    { id: '2026-05', label: 'Maio / 2026', liquido: 'R$ 5.540,00', bruto: 'R$ 6.600,00', status: 'Pago', data: '05/05/2026' },
    { id: '2026-04', label: 'Abril / 2026', liquido: 'R$ 5.540,00', bruto: 'R$ 6.600,00', status: 'Pago', data: '05/04/2026' },
    { id: '2026-03', label: 'Março / 2026', liquido: 'R$ 5.540,00', bruto: 'R$ 6.600,00', status: 'Pago', data: '05/03/2026' },
  ];

  const currentHolerite = holeriteHistory.find(h => h.id === selectedMonth) || holeriteHistory[0];

  const handleDownloadPDF = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-ocean-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-ocean-300 text-sm font-semibold">Carregando área do contador...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-ocean-950 via-ocean-900 to-slate-900 text-white font-sans">
        {/* Header */}
        <header className="py-6 px-6 md:px-12 flex justify-between items-center border-b border-ocean-800/40 backdrop-blur-md bg-ocean-950/50">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToHome} 
              className="flex items-center gap-2 text-ocean-200 hover:text-white transition-colors text-sm font-medium bg-ocean-800/40 hover:bg-ocean-800/80 px-3.5 py-2 rounded-lg border border-ocean-700/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </button>
            <img 
              src="https://i.imgur.com/Yk1zAk3.png" 
              alt="Audifor Consultores" 
              className="h-10 md:h-12 object-contain brightness-0 invert ml-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-ocean-500/20 text-ocean-300 border border-ocean-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Autenticação Segura via Clerk
            </span>
          </div>
        </header>

        {/* Body Portal */}
        <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Info & Features */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-ocean-800/50 border border-ocean-700/60 px-4 py-1.5 rounded-full text-ocean-300 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-ocean-400" />
                Portal do Contador & Colaborador
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Bem-vindo à sua <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-300 via-cyan-200 to-white">
                  Área Exclusiva
                </span>
              </h1>

              <p className="text-ocean-200 text-base md:text-lg leading-relaxed">
                Acesse com facilidade seu demonstrativo de pagamento (holerite) e solicite refeições diárias de forma simples e rápida.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-ocean-900/40 border border-ocean-800/60">
                  <div className="p-2.5 rounded-lg bg-ocean-500/20 text-ocean-300 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Holerite Digital Simplificado</h4>
                    <p className="text-xs text-ocean-300 mt-0.5">Consulte e solicite informações do seu demonstrativo de pagamento de forma rápida.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-ocean-900/40 border border-ocean-800/60">
                  <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Pedido de Almoço Integrado</h4>
                    <p className="text-xs text-ocean-300 mt-0.5">Faça o seu pedido de almoço diário em um clique diretamente no formulário oficial.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-ocean-900/40 border border-ocean-800/60">
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Segurança e Privacidade</h4>
                    <p className="text-xs text-ocean-300 mt-0.5">Autenticação gerenciada pelo Clerk com criptografia de ponta a ponta.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Clerk Auth Card */}
            <div className="lg:col-span-6 flex flex-col items-center w-full">
              <div className="w-full max-w-md bg-ocean-900/80 backdrop-blur-xl border border-ocean-700/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-ocean-950/80">
                <div className="flex items-center justify-between border-b border-ocean-800 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAuthMode('signin')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        authMode === 'signin'
                          ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-600/30'
                          : 'text-ocean-300 hover:text-white hover:bg-ocean-800/50'
                      }`}
                    >
                      Entrar na Conta
                    </button>
                    <button
                      onClick={() => setAuthMode('signup')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        authMode === 'signup'
                          ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-600/30'
                          : 'text-ocean-300 hover:text-white hover:bg-ocean-800/50'
                      }`}
                    >
                      Criar Conta
                    </button>
                  </div>
                </div>

                <div className="flex justify-center py-2 w-full">
                  {authMode === 'signin' ? (
                    <SignIn 
                      appearance={{
                        elements: {
                          rootBox: 'w-full',
                          cardBox: 'w-full shadow-none bg-transparent',
                          card: 'shadow-none bg-transparent p-0 w-full',
                          header: 'hidden',
                          main: 'w-full bg-transparent px-2',
                          footer: 'bg-white text-slate-700 border-t border-slate-100 rounded-b-2xl p-4 w-full',
                          footerAction: 'hidden',
                          formButtonPrimary: 'bg-ocean-600 hover:bg-ocean-500 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-ocean-600/30 transition-all w-full mt-2',
                          formFieldLabel: 'text-ocean-200 text-xs font-medium pl-1',
                          formFieldInput: 'bg-ocean-950/80 border-ocean-700/80 text-white rounded-xl text-sm focus:border-ocean-400 focus:ring-ocean-400 w-full px-3.5 py-2.5',
                          identityPreviewText: 'text-white',
                          formHeaderTitle: 'text-white',
                          formHeaderSubtitle: 'text-ocean-300',
                          formFieldInputShowPasswordButton: 'text-ocean-300 hover:text-white',
                          formFieldSuccessText: 'text-emerald-400',
                          formFieldErrorText: 'text-rose-400',
                          alert: 'bg-rose-950/50 border border-rose-800 text-rose-200 rounded-xl',
                        }
                      }}
                    />
                  ) : (
                    <SignUp 
                      appearance={{
                        elements: {
                          rootBox: 'w-full',
                          cardBox: 'w-full shadow-none bg-transparent',
                          card: 'shadow-none bg-transparent p-0 w-full',
                          header: 'hidden',
                          main: 'w-full bg-transparent px-2',
                          footer: 'bg-white text-slate-700 border-t border-slate-100 rounded-b-2xl p-4 w-full',
                          footerAction: 'hidden',
                          formButtonPrimary: 'bg-ocean-600 hover:bg-ocean-500 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-ocean-600/30 transition-all w-full mt-2',
                          formFieldLabel: 'text-ocean-200 text-xs font-medium pl-1',
                          formFieldInput: 'bg-ocean-950/80 border-ocean-700/80 text-white rounded-xl text-sm focus:border-ocean-400 focus:ring-ocean-400 w-full px-3.5 py-2.5',
                          formHeaderTitle: 'text-white',
                          formHeaderSubtitle: 'text-ocean-300',
                          formFieldInputShowPasswordButton: 'text-ocean-300 hover:text-white',
                          formFieldSuccessText: 'text-emerald-400',
                          formFieldErrorText: 'text-rose-400',
                          alert: 'bg-rose-950/50 border border-rose-800 text-rose-200 rounded-xl',
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navigation Header */}
        <header className="sticky top-0 z-40 bg-ocean-900 text-white shadow-lg border-b border-ocean-800">
          <div className="container mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">
            {/* Brand Logo & Back Button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={onBackToHome}
                className="flex items-center gap-1.5 text-xs text-ocean-200 hover:text-white bg-ocean-800/80 hover:bg-ocean-800 px-3 py-1.5 rounded-lg border border-ocean-700 transition-colors"
                title="Voltar para a Landing Page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Site Principal</span>
              </button>

              <div className="h-6 w-[1px] bg-ocean-700 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <img 
                  src="https://i.imgur.com/Yk1zAk3.png" 
                  alt="Audifor" 
                  className="h-8 md:h-9 object-contain brightness-0 invert" 
                />
                <span className="hidden md:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-ocean-700/60 text-ocean-200 border border-ocean-600/40">
                  Área do Contador
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Sessão: {tempoRestante}</span>
                </span>
              </div>
            </div>

            {/* Profile & Clerk UserButton */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none text-white">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.primaryEmailAddress?.emailAddress}
                </p>
                <p className="text-[11px] text-ocean-300 mt-0.5">Colaborador / Contador Audifor</p>
              </div>

              {/* Clerk User Button with Custom Styling */}
              <div className="p-0.5 bg-ocean-700/60 rounded-full border border-ocean-600/50">
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 border-2 border-ocean-400 shadow-sm'
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Greeting Section */}
        <section className="bg-gradient-to-r from-ocean-950 via-ocean-900 to-slate-900 text-white py-8 px-4 md:px-8 border-b border-ocean-800 shadow-inner">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Sessão Autenticada via Clerk
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                  Olá, {user?.firstName || 'Contador'}! 👋
                </h1>
                <p className="text-ocean-200 text-sm mt-1">
                  Painel de autoatendimento Audifor — consulte seu holerite e faça o pedido de almoço.
                </p>
              </div>

              {/* Action tabs */}
              <div className="flex items-center gap-2 bg-ocean-950/80 p-1.5 rounded-2xl border border-ocean-800/80">
                <button
                  onClick={() => setActiveTab('holerite')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    activeTab === 'holerite'
                      ? 'bg-ocean-600 text-white shadow-md shadow-ocean-600/40'
                      : 'text-ocean-300 hover:text-white hover:bg-ocean-900/60'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Holerite</span>
                </button>

                <button
                  onClick={() => setActiveTab('almoco')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    activeTab === 'almoco'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40'
                      : 'text-ocean-300 hover:text-white hover:bg-ocean-900/60'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span>Pedir Almoço</span>
                </button>

                <button
                  onClick={() => setActiveTab('ponto')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    activeTab === 'ponto'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40'
                      : 'text-ocean-300 hover:text-white hover:bg-ocean-900/60'
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Bater Ponto</span>
                </button>

              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="container mx-auto max-w-6xl px-4 md:px-8 py-8">
          {downloadSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Download Iniciado!</h4>
                  <p className="text-xs text-emerald-700">O holerite de {currentHolerite.label} foi baixado com sucesso no seu dispositivo.</p>
                </div>
              </div>
              <button onClick={() => setDownloadSuccess(false)} className="text-emerald-600 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: HOLERITE */}
          {activeTab === 'holerite' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-ocean-50 text-ocean-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Demonstrativo de Pagamento (Holerite)</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  Os holerites são gerados e enviados mensalmente. Para solicitar o seu demonstrativo ou tirar dúvidas, entre em contato diretamente com o Departamento Pessoal.
                </p>
                <div className="mt-6 flex justify-center">
                  <a
                    href="mailto:dp@audifor.com.br"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-ocean-600/30 transition-all"
                  >
                    Contatar Departamento Pessoal
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PEDIR ALMOÇO */}
          {activeTab === 'almoco' && (
            <div className="space-y-8">
              {/* Main Lunch Order Banner */}
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-amber-400/30">
                {/* Decorative Circles */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute right-20 top-0 w-32 h-32 bg-amber-300/20 rounded-full blur-xl pointer-events-none"></div>

                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30 mb-4 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></span>
                    <span>PEDIDOS ABERTOS DE HOJE (ATÉ ÀS 10:00)</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                    Solicitação do Almoço Diário
                  </h2>

                  <p className="mt-3 text-amber-100 text-sm md:text-base leading-relaxed">
                    Escolha a sua refeição para o dia de trabalho através do formulário oficial de almoço da Audifor. Atente-se às regras e horários de funcionamento do serviço.
                  </p>

                  {/* DIRECT BUTTON TO GOOGLE FORM URL */}
                  <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <a
                      href={LUNCH_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-base md:text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all group"
                    >
                      <Utensils className="w-6 h-6 text-amber-600 group-hover:rotate-12 transition-transform" />
                      <span>Fazer Pedido de Almoço</span>
                      <ExternalLink className="w-5 h-5 text-amber-500" />
                    </a>

                    <div className="text-amber-100 text-xs flex items-center gap-1.5 justify-center sm:justify-start">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Abre diretamente no formulário do Google</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules & Deadlines */}
              <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Horários e Regras de Pedido
                </h3>

                <ul className="space-y-4 text-xs md:text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-amber-50 text-amber-700 rounded-md shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-800 block text-sm">Horário Limite para Pedidos: até as 10:00</strong>
                      Todos os pedidos devem ser realizados rigorosamente até as 10:00. Pedidos feitos após este horário não serão processados.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-amber-50 text-amber-700 rounded-md shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-800 block text-sm">Horário de Almoço: 12:00 até as 13:00</strong>
                      O horário reservado para o almoço é das 12:00 às 13:00.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: BATER PONTO */}
          {activeTab === 'ponto' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Point Registration Card */}
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-emerald-400/30">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse"></span>
                      <span>SISTEMA DE PONTO ELETRÔNICO AUDIFOR</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                      Registro de Ponto
                    </h2>
                    
                    <p className="text-emerald-100 text-sm leading-relaxed">
                      Registre seus horários de entrada, almoço e saída com segurança. Todos os registros são validados e armazenados de acordo com a portaria vigente.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {renderizarBotaoPonto(
                        'Entrada', 
                        <Fingerprint className="w-4 h-4 text-emerald-600" />, 
                        'bg-white hover:bg-emerald-50 text-emerald-900'
                      )}
                      {renderizarBotaoPonto(
                        'Almoço', 
                        <Clock className="w-4 h-4 text-amber-500" />, 
                        'bg-emerald-500/30 hover:bg-emerald-500/50 text-white border border-emerald-400/30'
                      )}
                      {renderizarBotaoPonto(
                        'Retorno', 
                        <Clock className="w-4 h-4 text-amber-500" />, 
                        'bg-emerald-500/30 hover:bg-emerald-500/50 text-white border border-emerald-400/30'
                      )}
                      {renderizarBotaoPonto(
                        'Saída', 
                        <Fingerprint className="w-4 h-4 text-rose-300" />, 
                        'bg-rose-600 hover:bg-rose-700 text-white'
                      )}
                    </div>
                  </div>

                  {/* Right side clock display */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center bg-black/25 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
                    <Clock className="w-8 h-8 text-emerald-300 mb-2 animate-pulse" />
                    <span className="text-sm font-semibold tracking-wide text-emerald-200 uppercase">{dataAtual}</span>
                    <span className="text-4xl md:text-5xl font-black tracking-widest font-mono text-white mt-1 select-none">
                      {horaAtual}
                    </span>
                    <span className="text-[10px] text-emerald-200 mt-2">Hora oficial de Brasília</span>
                  </div>
                </div>
              </div>

              {pontoSucesso && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-sm animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold">{pontoSucesso}</span>
                </div>
              )}

              {/* Point Logs Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
                    <Fingerprint className="w-5 h-5 text-emerald-600" />
                    Registros do Dia
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Histórico recente</span>
                </div>

                {historicoPontos.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Fingerprint className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm">Nenhum ponto registrado hoje.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-3 px-5">Tipo</th>
                          <th className="py-3 px-5">Data</th>
                          <th className="py-3 px-5">Horário</th>
                          <th className="py-3 px-5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                        {historicoPontos.map((ponto) => (
                          <tr key={ponto.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-5 font-bold text-slate-800 flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                ponto.tipo === 'Entrada' ? 'bg-emerald-500' :
                                ponto.tipo === 'Saída' ? 'bg-rose-500' : 'bg-amber-500'
                              }`}></span>
                              {ponto.tipo}
                            </td>
                            <td className="py-3.5 px-5 text-slate-500">{ponto.dataRegistro}</td>
                            <td className="py-3.5 px-5 font-mono font-semibold text-slate-700">{ponto.horario}</td>
                            <td className="py-3.5 px-5 text-right">
                              <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-3 h-3" />
                                Confirmado
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        {/* MODAL: PREVIEW DO HOLERITE OFICIAL */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 text-slate-800">
              
              {/* Modal Header */}
              <div className="p-4 md:p-6 bg-ocean-900 text-white flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-ocean-300" />
                  <div>
                    <h3 className="font-bold text-base md:text-lg">Demonstrativo de Pagamento de Salário</h3>
                    <p className="text-xs text-ocean-200">Referência: {currentHolerite.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="p-2 text-ocean-200 hover:text-white hover:bg-ocean-800 rounded-lg transition-colors"
                    title="Imprimir Holerite"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setIsPreviewOpen(false)} 
                    className="p-2 text-ocean-200 hover:text-white hover:bg-ocean-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body - Official Payslip Mock Layout */}
              <div className="p-6 space-y-6 text-xs font-sans">
                {/* Employer & Employee Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-300 p-4 rounded-xl bg-slate-50">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Empregador</span>
                    <strong className="text-sm font-bold text-slate-900 block">AUDIFOR CONSULTORES E ASSOCIADOS LTDA.</strong>
                    <span className="text-slate-600 block">CNPJ: 12.345.678/0001-90</span>
                    <span className="text-slate-600 block">Endereço: Av. Paulista, 1000 - São Paulo/SP</span>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-slate-300 pt-2 md:pt-0 md:pl-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Trabalhador / Colaborador</span>
                    <strong className="text-sm font-bold text-slate-900 block">
                      {user?.fullName || user?.firstName || 'CONTADOR / COLABORADOR AUDIFOR'}
                    </strong>
                    <span className="text-slate-600 block">CPF: ***.456.789-** | CBO: 2522-10</span>
                    <span className="text-slate-600 block">Cargo: Contador Sênior / Consultor</span>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] border-b border-slate-300 uppercase">
                      <tr>
                        <th className="p-2.5">Cód</th>
                        <th className="p-2.5">Descrição</th>
                        <th className="p-2.5">Ref.</th>
                        <th className="p-2.5 text-right">Vencimentos</th>
                        <th className="p-2.5 text-right">Descontos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-mono">001</td>
                        <td className="p-2.5 font-bold">SALÁRIO BASE</td>
                        <td className="p-2.5">30d</td>
                        <td className="p-2.5 text-right font-bold text-emerald-700">R$ 6.850,00</td>
                        <td className="p-2.5 text-right text-slate-400">-</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono">102</td>
                        <td className="p-2.5">INSS RETIDO NA FONTE</td>
                        <td className="p-2.5">14%</td>
                        <td className="p-2.5 text-right text-slate-400">-</td>
                        <td className="p-2.5 text-right font-bold text-rose-600">R$ 751,99</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono">105</td>
                        <td className="p-2.5">IRRF DEPARTAMENTO PESSOAL</td>
                        <td className="p-2.5">7.5%</td>
                        <td className="p-2.5 text-right text-slate-400">-</td>
                        <td className="p-2.5 text-right font-bold text-rose-600">R$ 240,51</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono">204</td>
                        <td className="p-2.5">VALE TRANSPORTE</td>
                        <td className="p-2.5">6%</td>
                        <td className="p-2.5 text-right text-slate-400">-</td>
                        <td className="p-2.5 text-right font-bold text-rose-600">R$ 150,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Totals */}
                <div className="grid grid-cols-3 gap-3 border border-slate-300 p-4 rounded-xl bg-slate-50 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Vencimentos</span>
                    <strong className="text-sm font-extrabold text-emerald-700">R$ 6.850,00</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Descontos</span>
                    <strong className="text-sm font-extrabold text-rose-600">R$ 1.142,50</strong>
                  </div>
                  <div className="bg-emerald-100/60 p-2 rounded-lg border border-emerald-300">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Valor Líquido</span>
                    <strong className="text-base font-black text-emerald-900">{currentHolerite.liquido}</strong>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Baixar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Ponto */}
        {pontoParaConfirmar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 transform scale-100 transition-all duration-300">
              <div className="flex items-center gap-4 text-emerald-600 mb-4">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <Fingerprint className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-none">Confirmar Registro</h3>
                  <p className="text-xs text-slate-500 mt-1">Ponto Eletrônico Audifor</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 text-sm text-slate-700 leading-relaxed">
                Você está prestes a registrar o ponto de:
                <div className="flex items-center gap-2 mt-2 py-1.5 px-3 bg-white rounded-xl border border-slate-200/80 w-fit">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    pontoParaConfirmar === 'Entrada' ? 'bg-emerald-500' :
                    pontoParaConfirmar === 'Saída' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}></span>
                  <strong className="text-slate-900 font-extrabold">{pontoParaConfirmar}</strong>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Horário: <strong>{horaAtual}</strong> do dia <strong>{dataAtual}</strong></span>
                </div>
                {pontoParaConfirmar === 'Entrada' && fotoCapturada && (
                  <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden max-w-[120px] mx-auto shadow-sm">
                    <img src={fotoCapturada} alt="Facial" className="w-full h-auto object-cover" />
                    <span className="block text-[8px] text-center bg-slate-100 text-slate-500 py-0.5">Biometria Facial</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPontoParaConfirmar(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs md:text-sm border border-slate-200/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    const tipo = pontoParaConfirmar;
                    setPontoParaConfirmar(null);
                    await executarBaterPonto(tipo);
                  }}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs md:text-sm shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Captura Facial (Camera) */}
        {mostrandoCapturaFacial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-3 text-ocean-600 mb-4">
                <div className="p-2.5 bg-ocean-50 rounded-xl border border-ocean-100">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-none">Biometria Facial</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Regra de Entrada do Ponto</p>
                </div>
              </div>

              {/* Camera Stream viewport */}
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center mb-6">
                {!fotoCapturada ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <img 
                    src={fotoCapturada} 
                    alt="Foto Capturada" 
                    className="w-full h-full object-cover" 
                  />
                )}

                {cameraAtiva && (
                  <div className="absolute top-3 left-3 bg-red-600/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>CÂMERA ATIVA</span>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              {!fotoCapturada ? (
                <div className="flex gap-3">
                  <button
                    onClick={fecharCamera}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs md:text-sm border border-slate-200/50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={capturarFoto}
                    className="flex-1 py-3 px-4 bg-ocean-600 hover:bg-ocean-700 text-white font-bold rounded-xl text-xs md:text-sm shadow-lg shadow-ocean-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capturar Facial</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={iniciarCamera}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs md:text-sm border border-slate-200/50 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                    <span>Tentar Novamente</span>
                  </button>
                  <button
                    onClick={() => {
                      setMostrandoCapturaFacial(false);
                      setPontoParaConfirmar('Entrada');
                    }}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs md:text-sm shadow-lg shadow-emerald-600/30"
                  >
                    Continuar com esta Foto
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default AccountantArea;
