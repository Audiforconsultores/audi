import React, { useState, useEffect } from 'react';
import { useAuth, useUser, UserButton } from '@clerk/react';
import { obterSupabaseClient } from '../supabase';
import * as XLSX from 'xlsx';
import { 
  FileText, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Users, 
  Search, 
  Calendar, 
  Download, 
  User, 
  Camera, 
  MapPin, 
  Lock, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';

interface AdminAreaProps {
  onBackToPortal: () => void;
}

interface Employee {
  id?: string;
  clerk_id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  allow_home_office: boolean;
  created_at: string;
}

interface TimeRecord {
  id: string;
  clerk_id: string;
  record_type: string;
  recorded_at: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  is_valid: boolean;
}

interface EmployeePhoto {
  id: string;
  clerk_id: string;
  time_record_id: string;
  photo_data: string;
  created_at: string;
}

export const AdminArea: React.FC<AdminAreaProps> = ({ onBackToPortal }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'reports' | 'settings'>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [photos, setPhotos] = useState<EmployeePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [draftHomeOffice, setDraftHomeOffice] = useState<Record<string, boolean>>({});
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  
  // Modal de visualização de foto
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return;
      const supabaseClient = obterSupabaseClient(token);

      // Buscar colaboradores
      const { data: emps, error: empErr } = await supabaseClient
        .from('employees')
        .select('*')
        .order('name', { ascending: true });
      if (empErr) throw empErr;

      // Buscar registros de ponto
      const { data: recs, error: recErr } = await supabaseClient
        .from('time_records')
        .select('*')
        .order('recorded_at', { ascending: false });
      if (recErr) throw recErr;

      // Buscar fotos de biometria
      const { data: phts, error: phtErr } = await supabaseClient
        .from('employee_photos')
        .select('*');
      if (phtErr) throw phtErr;

      setEmployees(emps || []);
      setTimeRecords(recs || []);
      setPhotos(phts || []);
    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const formatarDataLocal = (dataString: string) => {
    const d = new Date(dataString);
    return d.toLocaleDateString('pt-BR');
  };

  const formatarHoraLocal = (dataString: string) => {
    const d = new Date(dataString);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const deTipoBancoParaFrontend = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return 'Entrada';
      case 'saida_almoco': return 'Almoço';
      case 'retorno_almoco': return 'Retorno';
      case 'saida': return 'Saída';
      default: return tipo;
    }
  };

  // Filtragem de registros de ponto para os relatórios
  const registrosFiltrados = timeRecords.filter(rec => {
    const emp = employees.find(e => e.clerk_id === rec.clerk_id);
    if (!emp) return false;

    // Filtro por busca (nome ou email)
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por colaborador específico
    const matchesEmployee = selectedEmployeeId ? rec.clerk_id === selectedEmployeeId : true;

    // Filtro por data
    const recDate = new Date(rec.recorded_at);
    recDate.setHours(0, 0, 0, 0);
    
    let matchesDateStart = true;
    if (filterDateStart) {
      const dStart = new Date(filterDateStart + 'T00:00:00');
      matchesDateStart = recDate >= dStart;
    }

    let matchesDateEnd = true;
    if (filterDateEnd) {
      const dEnd = new Date(filterDateEnd + 'T00:00:00');
      matchesDateEnd = recDate <= dEnd;
    }

    return matchesSearch && matchesEmployee && matchesDateStart && matchesDateEnd;
  });

  // Registros que serão exportados (selecionados ou todos os filtrados se nenhum selecionado)
  const registrosParaExportar = selectedRecordIds.length > 0 
    ? timeRecords.filter(r => selectedRecordIds.includes(r.id)) 
    : registrosFiltrados;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecordIds(registrosFiltrados.map(r => r.id));
    } else {
      setSelectedRecordIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRecordIds(prev => [...prev, id]);
    } else {
      setSelectedRecordIds(prev => prev.filter(rId => rId !== id));
    }
  };

  const obterNomeArquivoExportacao = (extensao: string) => {
    const registros = registrosParaExportar;
    const clerkIdsUnicos = Array.from(new Set(registros.map(r => r.clerk_id)));
    
    if (clerkIdsUnicos.length === 1) {
      const emp = employees.find(e => e.clerk_id === clerkIdsUnicos[0]);
      if (emp) {
        // Pega as duas primeiras partes do nome e junta com underline
        const partesNome = emp.name.trim().split(/\s+/);
        const nomeFormatado = partesNome.slice(0, 2).join('_');
        return `${nomeFormatado}_relatorio_ponto.${extensao}`;
      }
    }
    
    return `relatorio_pontos_${new Date().toISOString().split('T')[0]}.${extensao}`;
  };

  const exportarCSV = () => {
    const registros = registrosParaExportar;
    if (registros.length === 0) {
      alert('Nenhum registro para exportar.');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Colaborador,Email,Tipo de Ponto,Data,Hora,Distancia (m),Valido\n';

    registros.forEach(rec => {
      const emp = employees.find(e => e.clerk_id === rec.clerk_id);
      const nome = emp ? emp.name : 'Desconhecido';
      const email = emp ? emp.email : 'Desconhecido';
      const tipo = deTipoBancoParaFrontend(rec.record_type);
      const data = formatarDataLocal(rec.recorded_at);
      const hora = formatarHoraLocal(rec.recorded_at);
      const dist = rec.distance_meters || 0;
      const valido = rec.is_valid ? 'Sim' : 'Nao';
      
      csvContent += `"${nome}","${email}","${tipo}","${data}","${hora}",${dist},"${valido}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', obterNomeArquivoExportacao('csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarTXT = () => {
    const registros = registrosParaExportar;
    if (registros.length === 0) {
      alert('Nenhum registro para exportar.');
      return;
    }
    let txtContent = 'RELATÓRIO DE PONTO ELETRÔNICO - AUDIFOR CONSULTORES\n';
    txtContent += '==================================================\n\n';
    registros.forEach(rec => {
      const emp = employees.find(e => e.clerk_id === rec.clerk_id);
      txtContent += `Colaborador: ${emp?.name || 'Desconhecido'}\n`;
      txtContent += `Email: ${emp?.email || 'Desconhecido'}\n`;
      txtContent += `Tipo de Ponto: ${deTipoBancoParaFrontend(rec.record_type)}\n`;
      txtContent += `Data: ${formatarDataLocal(rec.recorded_at)} às ${formatarHoraLocal(rec.recorded_at)}\n`;
      txtContent += `Distância: ${rec.distance_meters ? `${rec.distance_meters} metros` : 'Bypass'}\n`;
      txtContent += `Validação: ${rec.is_valid ? 'Dentro do raio' : 'Fora do raio'}\n`;
      txtContent += '--------------------------------------------------\n';
    });

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = obterNomeArquivoExportacao('txt');
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportarXLSX = () => {
    const registros = registrosParaExportar;
    if (registros.length === 0) {
      alert('Nenhum registro para exportar.');
      return;
    }

    const dadosExcel = registros.map(rec => {
      const emp = employees.find(e => e.clerk_id === rec.clerk_id);
      return {
        'Colaborador': emp ? emp.name : 'Desconhecido',
        'Email': emp ? emp.email : 'Desconhecido',
        'Tipo de Ponto': deTipoBancoParaFrontend(rec.record_type),
        'Data': formatarDataLocal(rec.recorded_at),
        'Hora': formatarHoraLocal(rec.recorded_at),
        'Distancia (m)': rec.distance_meters || 0,
        'Status': rec.is_valid ? 'Valido' : 'Invalido'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pontos');
    XLSX.writeFile(workbook, obterNomeArquivoExportacao('xlsx'));
  };

  const exportarGoogleSheets = async () => {
    const registros = registrosParaExportar;
    if (registros.length === 0) {
      alert('Nenhum registro para exportar.');
      return;
    }
    let tsv = 'Colaborador\tEmail\tTipo de Ponto\tData\tHora\tDistancia (m)\tStatus\n';
    registros.forEach(rec => {
      const emp = employees.find(e => e.clerk_id === rec.clerk_id);
      const nome = emp ? emp.name : 'Desconhecido';
      const email = emp ? emp.email : 'Desconhecido';
      const tipo = deTipoBancoParaFrontend(rec.record_type);
      const data = formatarDataLocal(rec.recorded_at);
      const hora = formatarHoraLocal(rec.recorded_at);
      const dist = rec.distance_meters || 0;
      const status = rec.is_valid ? 'Valido' : 'Invalido';
      tsv += `${nome}\t${email}\t${tipo}\t${data}\t${hora}\t${dist}\t${status}\n`;
    });

    try {
      await navigator.clipboard.writeText(tsv);
      alert('Dados copiados com sucesso! Abra uma planilha em branco no Google Sheets, clique na primeira célula e aperte Ctrl+V para colar tudo organizado em colunas.');
    } catch (err) {
      console.error('Erro ao copiar para clipboard:', err);
      alert('Erro ao copiar para a área de transferência.');
    }
  };

  const salvarConfiguracoesHomeOffice = async () => {
    setSalvandoConfig(true);
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return;
      const supabaseClient = obterSupabaseClient(token);

      const promessas = Object.entries(draftHomeOffice).map(([clerkId, allow]) => {
        return supabaseClient
          .from('employees')
          .update({ allow_home_office: allow })
          .eq('clerk_id', clerkId);
      });

      await Promise.all(promessas);
      setDraftHomeOffice({});
      await carregarDados();
      alert('Configurações de Home Office salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configurações de Home Office:', err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setSalvandoConfig(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Painel Geral</span>
            </button>
            <div className="h-6 w-[1px] bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <img 
                src="https://i.imgur.com/Yk1zAk3.png" 
                alt="Audifor" 
                className="h-8 md:h-9 object-contain brightness-0 invert" 
              />
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                ADMINISTRATIVO
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none text-white">{user?.firstName || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Gestor de Recursos</p>
            </div>
            <div className="p-0.5 bg-slate-800 rounded-full border border-slate-700">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-6 px-4 md:px-8 border-b border-slate-800">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-red-400" />
              <span>Painel de Auditoria de Ponto</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Visualize fotos de biometria facial, rastreie distâncias físicas e exporte relatórios completos de pontos.
            </p>
          </div>

          {/* Navigation Tab Menu */}
          <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'employees' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Colaboradores ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'reports' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Relatório de Batidas
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'settings' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Configurações
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="container mx-auto max-w-6xl px-4 md:px-8 py-8 flex-1">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-600 border-t-red-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm mt-3 font-semibold">Carregando base de auditoria...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: VISÃO GERAL */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium uppercase">Colaboradores</span>
                    <strong className="text-2xl font-black text-slate-800">{employees.length}</strong>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium uppercase">Total de Batidas</span>
                    <strong className="text-2xl font-black text-slate-800">{timeRecords.length}</strong>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium uppercase">Biometrias Registradas</span>
                    <strong className="text-2xl font-black text-slate-800">{photos.length}</strong>
                  </div>
                </div>

                {/* Recent activity log */}
                <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-2">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Últimos Registros Realizados</h3>
                    <button 
                      onClick={() => setActiveTab('reports')} 
                      className="text-xs text-red-600 hover:text-red-800 font-bold"
                    >
                      Ver todos os relatórios
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {timeRecords.slice(0, 5).map(rec => {
                      const emp = employees.find(e => e.clerk_id === rec.clerk_id);
                      const foto = photos.find(p => p.time_record_id === rec.id);

                      return (
                        <div key={rec.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700">
                              {emp?.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900">{emp?.name || 'Desconhecido'}</h4>
                              <p className="text-[11px] text-slate-500">{emp?.email}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                              {deTipoBancoParaFrontend(rec.record_type)}
                            </span>
                            <div className="text-xs text-slate-500">
                              <span>{formatarDataLocal(rec.recorded_at)} às {formatarHoraLocal(rec.recorded_at)}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              rec.is_valid 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {rec.is_valid ? 'Válido' : 'Fora de Raio'}
                            </span>
                            {foto && (
                              <button
                                onClick={() => setActivePhoto(foto.photo_data)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold bg-ocean-50 text-ocean-700 hover:bg-ocean-100 border border-ocean-200 px-2.5 py-1 rounded-md transition-colors"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Ver Foto</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COLABORADORES */}
            {activeTab === 'employees' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left panel: List of employees */}
                <div className="md:col-span-5 space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome ou email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs md:text-sm focus:border-red-400 focus:ring-red-400"
                    />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden max-h-[500px] overflow-y-auto">
                    {employees
                      .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(emp => (
                        <button
                          key={emp.clerk_id}
                          onClick={() => setSelectedEmployeeId(emp.clerk_id)}
                          className={`w-full p-4 text-left flex items-center justify-between transition-colors ${
                            selectedEmployeeId === emp.clerk_id ? 'bg-red-50/40 border-r-4 border-red-500' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div>
                            <h4 className="text-xs md:text-sm font-bold text-slate-900">{emp.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">{emp.email}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            emp.is_admin 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {emp.is_admin ? 'Admin' : 'Colaborador'}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Right panel: Employee individual report */}
                <div className="md:col-span-7">
                  {selectedEmployeeId ? (
                    (() => {
                      const emp = employees.find(e => e.clerk_id === selectedEmployeeId);
                      const empRecords = timeRecords.filter(r => r.clerk_id === selectedEmployeeId);
                      const empPhotos = photos.filter(p => p.clerk_id === selectedEmployeeId);

                      return (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                              <h3 className="text-lg font-black text-slate-900">{emp?.name}</h3>
                              <p className="text-xs text-slate-500 mt-0.5">{emp?.email}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">Cadastrado em {formatarDataLocal(emp?.created_at || '')}</span>
                          </div>

                          {/* Photos grid */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Biometria Facial (Histórico)</h4>
                            {empPhotos.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">Nenhuma foto registrada para este colaborador.</p>
                            ) : (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {empPhotos.map(photo => {
                                  const linkedRecord = timeRecords.find(r => r.id === photo.time_record_id);
                                  return (
                                    <div 
                                      key={photo.id}
                                      onClick={() => setActivePhoto(photo.photo_data)}
                                      className="border border-slate-200 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:border-red-500 transition-all hover:scale-[1.03] bg-slate-50"
                                      title="Clique para ampliar"
                                    >
                                      <img src={photo.photo_data} alt="Biometria" className="w-full aspect-square object-cover" />
                                      <span className="block text-[8px] text-center font-bold bg-slate-100 text-slate-500 py-1 leading-tight">
                                        {linkedRecord ? formatarDataLocal(linkedRecord.recorded_at) : 'Facial'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Records list */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Histórico de Batidas de Ponto</h4>
                            {empRecords.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">Nenhum ponto registrado por este colaborador.</p>
                            ) : (
                              <div className="bg-slate-50 rounded-2xl border border-slate-200/60 overflow-hidden divide-y divide-slate-100">
                                {empRecords.map(rec => (
                                  <div key={rec.id} className="p-3.5 flex items-center justify-between text-xs md:text-sm">
                                    <div className="flex items-center gap-3">
                                      <span className={`w-2.5 h-2.5 rounded-full ${
                                        rec.record_type === 'entrada' ? 'bg-emerald-500' :
                                        rec.record_type === 'saida' ? 'bg-rose-500' : 'bg-amber-500'
                                      }`}></span>
                                      <span className="font-extrabold text-slate-800">{deTipoBancoParaFrontend(rec.record_type)}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium text-slate-700">{formatarDataLocal(rec.recorded_at)} às {formatarHoraLocal(rec.recorded_at)}</span>
                                      <span className="block text-[9px] text-slate-400">{rec.is_valid ? 'Dentro do raio' : `${rec.distance_meters}m do escritório`}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
                      <User className="w-16 h-16 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
                      <h3 className="text-sm font-bold text-slate-800">Visualizar Perfil Completo</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Selecione um colaborador na lista ao lado para ver os dados cadastrais, fotos biométricas e histórico detalhado de pontos.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: RELATÓRIOS */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                {/* Filter bar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="Pesquisar colaborador..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs md:text-sm focus:border-red-400 focus:ring-red-400"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={filterDateStart}
                        onChange={e => setFilterDateStart(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs md:text-sm text-slate-600 focus:border-red-400 focus:ring-red-400"
                        title="Data Inicial"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={filterDateEnd}
                        onChange={e => setFilterDateEnd(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs md:text-sm text-slate-600 focus:border-red-400 focus:ring-red-400"
                        title="Data Final"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={exportarCSV}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                      title="Exportar em formato CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={exportarXLSX}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                      title="Exportar em formato Excel (.xls)"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>XLSX</span>
                    </button>
                    <button
                      onClick={exportarTXT}
                      className="px-3.5 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                      title="Exportar em formato de Texto (.txt)"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>TXT</span>
                    </button>
                    <button
                      onClick={exportarGoogleSheets}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                      title="Copiar dados para colar no Google Sheets"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Google Sheets</span>
                    </button>
                    {(searchQuery || filterDateStart || filterDateEnd || selectedRecordIds.length > 0) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterDateStart('');
                          setFilterDateEnd('');
                          setSelectedRecordIds([]);
                        }}
                        className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-3 px-5 w-10">
                            <input
                              type="checkbox"
                              checked={registrosFiltrados.length > 0 && selectedRecordIds.length === registrosFiltrados.length}
                              onChange={e => handleSelectAll(e.target.checked)}
                              className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-5">Colaborador</th>
                          <th className="py-3 px-5">Tipo</th>
                          <th className="py-3 px-5">Data</th>
                          <th className="py-3 px-5">Hora</th>
                          <th className="py-3 px-5">Distância</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5 text-right">Biometria</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                        {registrosFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400">
                              Nenhum registro de ponto corresponde aos filtros definidos.
                            </td>
                          </tr>
                        ) : (
                          registrosFiltrados.map(rec => {
                            const emp = employees.find(e => e.clerk_id === rec.clerk_id);
                            const foto = photos.find(p => p.time_record_id === rec.id);

                            return (
                              <tr key={rec.id} className={`hover:bg-slate-50/30 transition-colors ${
                                selectedRecordIds.includes(rec.id) ? 'bg-red-50/20' : ''
                              }`}>
                                <td className="py-3.5 px-5 w-10">
                                  <input
                                    type="checkbox"
                                    checked={selectedRecordIds.includes(rec.id)}
                                    onChange={e => handleSelectRow(rec.id, e.target.checked)}
                                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3.5 px-5">
                                  <strong className="text-slate-900 block font-extrabold">{emp?.name || 'Desconhecido'}</strong>
                                  <span className="text-[10px] text-slate-500">{emp?.email}</span>
                                </td>
                                <td className="py-3.5 px-5 font-semibold text-slate-700">
                                  {deTipoBancoParaFrontend(rec.record_type)}
                                </td>
                                <td className="py-3.5 px-5 text-slate-500 font-medium">
                                  {formatarDataLocal(rec.recorded_at)}
                                </td>
                                <td className="py-3.5 px-5 font-mono font-bold text-slate-700">
                                  {formatarHoraLocal(rec.recorded_at)}
                                </td>
                                <td className="py-3.5 px-5 text-slate-500 font-medium">
                                  {rec.distance_meters ? `${rec.distance_meters}m` : 'Bypass'}
                                </td>
                                <td className="py-3.5 px-5">
                                  <span className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-bold border ${
                                    rec.is_valid 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                    {rec.is_valid ? 'Válido' : 'Inválido'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  {foto ? (
                                    <button
                                      onClick={() => setActivePhoto(foto.photo_data)}
                                      className="p-1 border border-slate-200 rounded-lg hover:border-red-500 transition-colors bg-slate-50 inline-block overflow-hidden shadow-sm"
                                    >
                                      <img src={foto.photo_data} alt="Biometria" className="w-8 h-8 object-cover" />
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic font-medium pr-2">N/A</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CONFIGURAÇÕES */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900">Configuração de Permissão de Batida (Home Office)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecione quais colaboradores podem bater o ponto remotamente (Home Office). Colaboradores com essa opção ativa terão a geocerca (bloqueio de distância de 100m) desativada individualmente. Os demais devem bater o ponto obrigatoriamente do escritório.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                        <th className="py-3 px-5">Colaborador</th>
                        <th className="py-3 px-5">Email</th>
                        <th className="py-3 px-5">Perfil</th>
                        <th className="py-3 px-5 text-right">Permitir Ponto Remoto / Home Office</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                      {employees.map(emp => {
                        const isInDraft = draftHomeOffice[emp.clerk_id] !== undefined;
                        const valorAtual = isInDraft ? draftHomeOffice[emp.clerk_id] : (emp.allow_home_office || false);

                        return (
                          <tr key={emp.clerk_id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="py-4 px-5">
                              <strong className="text-slate-900 block font-extrabold">{emp.name}</strong>
                            </td>
                            <td className="py-4 px-5 text-slate-500 font-medium">
                              {emp.email}
                            </td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-bold ${
                                emp.is_admin ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {emp.is_admin ? 'Administrador' : 'Colaborador'}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right flex justify-end">
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={valorAtual}
                                  onChange={(e) => {
                                    const novoValor = e.target.checked;
                                    setDraftHomeOffice(prev => ({
                                      ...prev,
                                      [emp.clerk_id]: novoValor
                                    }));
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Save configurations footer bar */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  {Object.keys(draftHomeOffice).length > 0 && (
                    <button
                      onClick={() => setDraftHomeOffice({})}
                      disabled={salvandoConfig}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                    >
                      Descartar Alterações
                    </button>
                  )}
                  <button
                    onClick={salvarConfiguracoesHomeOffice}
                    disabled={salvandoConfig || Object.keys(draftHomeOffice).length === 0}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
                  >
                    {salvandoConfig ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>Salvar Configurações ({Object.keys(draftHomeOffice).length})</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Photo Viewer Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 max-w-lg w-full relative shadow-2xl">
            <button 
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-2 border border-slate-700 shadow-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center pb-3 text-slate-300 font-bold border-b border-slate-800 mb-4 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-red-400" />
              <span>Ampliação de Biometria Facial</span>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black border border-slate-850 shadow-inner">
              <img src={activePhoto} alt="Biometria" className="w-full h-auto object-contain max-h-[75vh]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArea;
