
import React from 'react';
import { Expense, UserSettings, ExpenseCategory } from '../types';

interface DashboardProps {
  expenses: Expense[];
  settings: UserSettings;
  remainingAdvance: number;
  totalSpent: number;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, settings, remainingAdvance, totalSpent }) => {
  const recentExpenses = expenses.slice(0, 5);

  const getCategoryColor = (category: ExpenseCategory) => {
    switch (category) {
      case ExpenseCategory.FOOD: return 'bg-orange-100 text-orange-600';
      case ExpenseCategory.FUEL: return 'bg-amber-100 text-amber-600';
      case ExpenseCategory.LODGING: return 'bg-blue-100 text-blue-600';
      case ExpenseCategory.PARKING: return 'bg-purple-100 text-purple-600';
      case ExpenseCategory.TOOLS: return 'bg-green-100 text-green-600';
      case ExpenseCategory.WASHING: return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryBarColor = (category: ExpenseCategory) => {
    switch (category) {
      case ExpenseCategory.FOOD: return 'bg-orange-500';
      case ExpenseCategory.FUEL: return 'bg-amber-500';
      case ExpenseCategory.LODGING: return 'bg-blue-500';
      case ExpenseCategory.PARKING: return 'bg-purple-500';
      case ExpenseCategory.TOOLS: return 'bg-green-500';
      case ExpenseCategory.WASHING: return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  // Calcular totais por categoria
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="-mt-10 space-y-6 pb-6">
      {/* Balance Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="relative z-10">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Saldo Atual</p>
          <h2 className={`text-4xl font-black tracking-tighter ${remainingAdvance < 0 ? 'text-red-600' : 'text-indigo-600'}`}>
            R$ {remainingAdvance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-50">
            <div>
              <p className="text-gray-400 text-[9px] font-black uppercase">Adiantado</p>
              <p className="text-gray-800 font-bold text-sm">R$ {settings.monthlyAdvance.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-[9px] font-black uppercase">Gasto Total</p>
              <p className="text-gray-800 font-bold text-sm">R$ {totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Card */}
      {remainingAdvance < 0 && (
        <div className="bg-red-600 rounded-3xl p-4 flex items-center space-x-4 shadow-lg animate-pulse">
          <div className="bg-white/20 p-2 rounded-xl">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-white text-xs font-black uppercase tracking-tight">Limite atingido! Reembolso pendente.</p>
        </div>
      )}

      {/* Gastos por Categoria (Gráfico Visual) */}
      {expenses.length > 0 && (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Distribuição de Gastos</h3>
          <div className="space-y-4">
            {(Object.entries(categoryTotals) as [string, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([cat, total]) => {
                const percentage = (total / totalSpent) * 100;
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-gray-600">{cat}</span>
                      <span className="text-gray-400">R$ {total.toFixed(2)} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getCategoryBarColor(cat as ExpenseCategory)}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Atividade Recente</h3>
        </div>
        
        <div className="space-y-3">
          {recentExpenses.length > 0 ? (
            recentExpenses.map(expense => (
              <div key={expense.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-transform">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${getCategoryColor(expense.category)}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-sm tracking-tight">{expense.description || ''}</p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 leading-none">R$ {expense.amount.toFixed(2)}</p>
                  {expense.isPersonalMoney && <p className="text-[8px] font-black text-orange-600 uppercase mt-1 bg-orange-50 px-1.5 py-0.5 rounded-md">Próprio</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-100/50 rounded-[2rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Nenhuma despesa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
