import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  BarChart3,
  LayoutDashboard,
  Settings,
  LogOut,
  Search,
  Calendar,
  Clock,
  MessageSquare,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Objective, KeyResult, DailyUpdate } from './types';

export default function App() {
  const [okrs, setOkrs] = useState<Objective[]>([]);
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [newObjective, setNewObjective] = useState({ title: '', description: '', deadline: '' });
  const [activeTab, setActiveTab] = useState<'okrs' | 'feed'>('okrs');

  const fetchData = async () => {
    try {
      const [okrsRes, updatesRes] = await Promise.all([
        fetch('/api/okrs'),
        fetch('/api/daily-updates')
      ]);
      const okrsData = await okrsRes.json();
      const updatesData = await updatesRes.json();
      setOkrs(okrsData);
      setUpdates(updatesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newObjective),
      });
      if (res.ok) {
        setNewObjective({ title: '', description: '', deadline: '' });
        setIsAddingObjective(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error adding objective:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <img 
            src="https://i.ibb.co/gZcFGqVt/Brand-03.png" 
            alt="Even Logo" 
            className="h-8 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'okrs'} 
            onClick={() => setActiveTab('okrs')}
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Feed de Atualizações" 
            active={activeTab === 'feed'} 
            onClick={() => setActiveTab('feed')}
          />
          <NavItem icon={<Target size={20} />} label="Meus OKRs" />
          <NavItem icon={<Users size={20} />} label="Equipes" />
          <NavItem icon={<BarChart3 size={20} />} label="Relatórios" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <NavItem icon={<Settings size={20} />} label="Configurações" />
          <NavItem icon={<LogOut size={20} />} label="Sair" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-bottom border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar objetivos ou metas..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-even/20 transition-all outline-none text-sm"
              />
            </div>
          </div>
          
          <button 
            onClick={() => setIsAddingObjective(true)}
            className="flex items-center gap-2 bg-even hover:bg-even-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            Novo Objetivo
          </button>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {activeTab === 'okrs' ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Acompanhamento de OKRs</h1>
                <p className="text-slate-500">Visualize e gerencie o progresso das metas em cascata.</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-even"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {okrs.map((okr) => (
                    <OKRCard 
                      key={okr.id} 
                      okr={okr} 
                      onRefresh={fetchData}
                    />
                  ))}
                  
                  {okrs.length === 0 && !isAddingObjective && (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                      <Target className="mx-auto text-slate-300 mb-4" size={48} />
                      <h3 className="text-lg font-medium text-slate-900">Nenhum objetivo cadastrado</h3>
                      <p className="text-slate-500 mb-6">Comece definindo seu primeiro objetivo estratégico.</p>
                      <button 
                        onClick={() => setIsAddingObjective(true)}
                        className="text-even font-semibold hover:underline"
                      >
                        Criar meu primeiro OKR
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Feed de Resultados Diários</h1>
                <p className="text-slate-500">Acompanhe o que o time está entregando hoje.</p>
              </div>
              
              <div className="space-y-4">
                {updates.map((update) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={update.id} 
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-even/10 text-even rounded-full">
                        <TrendingUp size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-900">
                            {update.kr_owner} postou um resultado
                          </h4>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(update.created_at).toLocaleDateString()} {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-3">
                          Hoje gerado <span className="font-bold text-even">{update.value} {update.kr_unit}</span> para a meta de <span className="font-bold">{update.kr_target} {update.kr_unit}</span> de <span className="italic">"{update.kr_title}"</span>.
                        </p>
                        {update.comment && (
                          <div className="bg-slate-50 p-3 rounded-lg flex items-start gap-2 border border-slate-100">
                            <MessageSquare size={14} className="text-slate-400 mt-1" />
                            <p className="text-sm text-slate-500 italic">{update.comment}</p>
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                            {update.objective_title}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {updates.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <History className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-slate-900">Nenhuma atualização hoje</h3>
                    <p className="text-slate-500">Incentive o time a postar seus resultados diários!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal Adicionar Objetivo */}
      <AnimatePresence>
        {isAddingObjective && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Novo Objetivo Estratégico</h2>
              </div>
              <form onSubmit={handleAddObjective} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título do Objetivo</label>
                  <input 
                    required
                    type="text" 
                    value={newObjective.title}
                    onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                    placeholder="Ex: Vender 1 unidade"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-even/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prazo Final</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="date" 
                      value={newObjective.deadline}
                      onChange={(e) => setNewObjective({ ...newObjective, deadline: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-even/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (Opcional)</label>
                  <textarea 
                    value={newObjective.description}
                    onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                    placeholder="Descreva o propósito deste objetivo..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-even/20 outline-none transition-all h-24 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsAddingObjective(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-even text-white rounded-lg font-medium hover:bg-even-dark transition-colors"
                  >
                    Criar Objetivo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active = false, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-even/10 text-even' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

const OKRCard: React.FC<{ okr: Objective, onRefresh: () => void }> = ({ okr, onRefresh }) => {
  const [isAddingKR, setIsAddingKR] = useState(false);
  const [newKR, setNewKR] = useState({ title: '', owner: '', target_value: 0, unit: '' });

  const handleAddKR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/key-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newKR, objective_id: okr.id }),
      });
      if (res.ok) {
        setNewKR({ title: '', owner: '', target_value: 0, unit: '' });
        setIsAddingKR(false);
        onRefresh();
      }
    } catch (err) {
      console.error('Error adding KR:', err);
    }
  };

  const daysRemaining = okr.deadline ? Math.ceil((new Date(okr.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-even/10 text-even rounded-lg">
              <Target size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{okr.title}</h3>
                {daysRemaining !== null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${daysRemaining < 7 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    {daysRemaining < 0 ? 'Expirado' : `${daysRemaining} dias restantes`}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{okr.description || 'Sem descrição'}</p>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <Calendar size={12} />
                Prazo: {okr.deadline ? new Date(okr.deadline).toLocaleDateString() : 'Não definido'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-even">{okr.progress}%</span>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Progresso Geral</p>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${okr.progress}%` }}
            className="h-full bg-even"
          />
        </div>
      </div>

      <div className="bg-slate-50/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Resultados-Chave (KRs)</h4>
          <button 
            onClick={() => setIsAddingKR(true)}
            className="text-xs font-bold text-even hover:text-even-dark flex items-center gap-1"
          >
            <Plus size={14} />
            Adicionar KR
          </button>
        </div>

        <div className="space-y-3">
          {okr.key_results.map((kr) => (
            <KRItem key={kr.id} kr={kr} onRefresh={onRefresh} />
          ))}
          
          {okr.key_results.length === 0 && !isAddingKR && (
            <p className="text-sm text-slate-400 italic py-2">Nenhum resultado-chave definido para este objetivo.</p>
          )}

          {isAddingKR && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddKR}
              className="bg-white p-4 rounded-xl border border-even/20 shadow-sm space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <input 
                  required
                  type="text" 
                  placeholder="Título do KR (Ex: Gerar 100 leads)"
                  className="col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-even/20"
                  value={newKR.title}
                  onChange={(e) => setNewKR({ ...newKR, title: e.target.value })}
                />
                <input 
                  required
                  type="text" 
                  placeholder="Responsável (Ex: Gestor de Tráfego)"
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-even/20"
                  value={newKR.owner}
                  onChange={(e) => setNewKR({ ...newKR, owner: e.target.value })}
                />
                <div className="flex gap-2">
                  <input 
                    required
                    type="number" 
                    placeholder="Meta"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-even/20"
                    value={newKR.target_value || ''}
                    onChange={(e) => setNewKR({ ...newKR, target_value: Number(e.target.value) })}
                  />
                  <input 
                    type="text" 
                    placeholder="Unid."
                    className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-even/20"
                    value={newKR.unit}
                    onChange={(e) => setNewKR({ ...newKR, unit: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-even text-white text-sm font-bold rounded-lg hover:bg-even-dark transition-colors"
                >
                  Salvar KR
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAddingKR(false)}
                  className="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
};

const KRItem: React.FC<{ kr: KeyResult, onRefresh: () => void }> = ({ kr, onRefresh }) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInValue, setCheckInValue] = useState<number>(0);
  const [comment, setComment] = useState('');
  
  const progress = Math.min(100, Math.round((kr.current_value / kr.target_value) * 100));

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/daily-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kr_id: kr.id, value: checkInValue, comment }),
      });
      if (res.ok) {
        setIsCheckingIn(false);
        setCheckInValue(0);
        setComment('');
        onRefresh();
      }
    } catch (err) {
      console.error('Error posting check-in:', err);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 group hover:border-even/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md ${progress === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            {progress === 100 ? <CheckCircle2 size={16} /> : <TrendingUp size={16} />}
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900">{kr.title}</h5>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {kr.owner}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className="font-bold text-slate-900">{kr.current_value}</span>
              <span className="text-sm font-medium text-slate-400">/ {kr.target_value} {kr.unit}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Progresso: {progress}%</p>
          </div>
          <button 
            onClick={() => setIsCheckingIn(!isCheckingIn)}
            className="p-2 bg-slate-50 text-slate-400 hover:bg-even/10 hover:text-even rounded-lg transition-all"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      
      <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden mb-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-even'}`}
        />
      </div>

      <AnimatePresence>
        {isCheckingIn && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCheckIn}
            className="overflow-hidden pt-2 space-y-3"
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resultado de Hoje</label>
                <input 
                  required
                  type="number" 
                  value={checkInValue || ''}
                  onChange={(e) => setCheckInValue(Number(e.target.value))}
                  placeholder="Qtd gerada hoje"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-even/20"
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Comentário (Opcional)</label>
                <input 
                  type="text" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="O que aconteceu hoje?"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-even/20"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 py-1.5 bg-even text-white text-xs font-bold rounded-lg hover:bg-even-dark transition-colors"
              >
                Postar Resultado
              </button>
              <button 
                type="button"
                onClick={() => setIsCheckingIn(false)}
                className="px-3 py-1.5 text-slate-500 text-xs font-bold hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
