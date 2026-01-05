
import React, { useState, useEffect } from 'react';
import { Expense, UserSettings } from './types';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import ShareReport from './components/ShareReport';
import ConfirmModal from './components/ConfirmModal';

const STORAGE_KEY = 'expensy_data_v1';
const SETTINGS_KEY = 'expensy_settings_v1';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      monthlyAdvance: 0,
      userName: 'Técnico de Campo'
    };
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'list' | 'report'>('dashboard');
  
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    action: () => {}
  });

  useEffect(() => {
    if (expenses.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const addExpense = (newExpense: Omit<Expense, 'id' | 'timestamp'>) => {
    const id = "ID-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
    const expense: Expense = {
      ...newExpense,
      id,
      timestamp: Date.now()
    };
    setExpenses(prev => [expense, ...prev]);
    setIsFormOpen(false);
  };

  const deleteExpense = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Excluir Nota?",
      message: "Este registro será removido permanentemente.",
      confirmLabel: "Sim, Excluir",
      action: () => {
        const updated = expenses.filter(e => e.id !== id);
        setExpenses(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const resetCycle = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Zerar Aplicativo?",
      message: "Isso apagará todas as notas e fotos. Esta ação não pode ser desfeita.",
      confirmLabel: "Apagar Tudo",
      action: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.clear(); 
        window.location.href = window.location.pathname + "?reset=" + Date.now();
      }
    });
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingAdvance = settings.monthlyAdvance - totalSpent;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 print:p-0 print:bg-white">
      <div className={view === 'report' ? 'print:hidden' : ''}>
        <Header 
          userName={settings.userName} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
        />

        <main className="max-w-md mx-auto px-4 pt-6">
          {view === 'dashboard' ? (
            <Dashboard 
              expenses={expenses} 
              settings={settings}
              remainingAdvance={remainingAdvance}
              totalSpent={totalSpent}
            />
          ) : view === 'list' ? (
            <ExpenseList 
              expenses={expenses} 
              onDelete={deleteExpense}
              onDeleteAll={resetCycle}
              onGenerateReport={() => setView('report')}
            />
          ) : null}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-20 px-4 z-40 pb-safe shadow-lg">
          <button onClick={() => setView('dashboard')} className={`flex flex-col items-center py-2 space-y-1 w-20 transition-all ${view === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Início</span>
          </button>

          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white p-4 rounded-full -mt-12 shadow-xl shadow-indigo-200 active:scale-90 transition-transform border-4 border-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <button onClick={() => setView('list')} className={`flex flex-col items-center py-2 space-y-1 w-20 transition-all ${view === 'list' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Notas</span>
          </button>
        </nav>
      </div>

      {isFormOpen && <ExpenseForm onSubmit={addExpense} onClose={() => setIsFormOpen(false)} />}
      
      {isSettingsOpen && (
        <SettingsModal 
          settings={settings} 
          onSave={(newSettings) => {
            setSettings(newSettings);
            setIsSettingsOpen(false);
          }} 
          onClose={() => setIsSettingsOpen(false)}
          onReset={resetCycle}
        />
      )}

      {view === 'report' && (
        <ShareReport 
          expenses={expenses} 
          settings={settings} 
          onClose={() => setView('dashboard')} 
        />
      )}

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        onConfirm={confirmConfig.action}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;
