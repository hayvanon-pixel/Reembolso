
import React from 'react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onGenerateReport: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onDeleteAll, onGenerateReport }) => {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase">Minhas Notas</h2>
        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black">{expenses.length} TOTAL</span>
      </div>

      <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="bg-white/20 p-4 rounded-3xl shadow-inner backdrop-blur-md">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-black text-xl leading-tight italic">Relatório</h3>
            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Fechar Ciclo Atual</p>
          </div>
        </div>
        <button 
          onClick={() => expenses.length > 0 ? onGenerateReport() : alert("Adicione notas primeiro.")}
          className={`w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 ${expenses.length > 0 ? 'bg-white text-indigo-600 hover:bg-gray-50' : 'bg-indigo-400 text-indigo-200 cursor-not-allowed opacity-50'}`}
        >
          Gerar Arquivo Digital
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Histórico Detalhado</h3>
          {expenses.length > 0 && (
            <button 
              onClick={onDeleteAll}
              className="text-[9px] font-black text-red-500 bg-red-50 px-3 py-2 rounded-xl active:bg-red-600 active:text-white transition-all uppercase"
            >
              Resetar Mês
            </button>
          )}
        </div>

        {expenses.length > 0 ? (
          expenses.map(expense => (
            <div key={expense.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transform active:scale-[0.98] transition-all">
              <div className="p-5 flex justify-between items-center">
                <div className="flex items-center space-x-4 flex-1 overflow-hidden">
                  <div className="relative">
                    {expense.receiptImage && (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-50 shadow-md">
                        <img src={expense.receiptImage} className="w-full h-full object-cover" alt="Nota" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg uppercase tracking-tighter">{expense.category}</span>
                      {expense.isPersonalMoney && (
                        <span className="text-[9px] font-black px-2 py-0.5 bg-orange-100 text-orange-600 rounded-lg uppercase tracking-tighter">Próprio</span>
                      )}
                    </div>
                    <p className="font-black text-gray-800 text-sm truncate tracking-tight">{expense.description || ''}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-3">
                  <p className="font-black text-gray-900 text-lg leading-none tracking-tighter italic">R$ {expense.amount.toFixed(2)}</p>
                  <button 
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      onDelete(expense.id);
                    }}
                    className="p-4 -mr-3 text-gray-300 hover:text-red-500 transition-all flex items-center justify-center min-w-[50px]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100">
             <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Vazio por enquanto</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
