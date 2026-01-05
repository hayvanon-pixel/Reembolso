
import React from 'react';
import { Expense, UserSettings } from '../types';

interface ShareReportProps {
  expenses: Expense[];
  settings: UserSettings;
  onClose: () => void;
}

const ShareReport: React.FC<ShareReportProps> = ({ expenses, settings, onClose }) => {
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = settings.monthlyAdvance - totalSpent;
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const expensesWithImages = expenses.filter(e => e.receiptImage);

  const generateDigitalReport = () => {
    const reportHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório - ${settings.userName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print { .no-print { display: none; } }
        body { background-color: #f3f4f6; }
    </style>
</head>
<body class="p-4 md:p-10">
    <div class="max-w-4xl mx-auto bg-white shadow-2xl rounded-[2rem] overflow-hidden">
        <div class="bg-indigo-700 p-8 text-white flex justify-between items-start">
            <div>
                <h1 class="text-3xl font-black uppercase tracking-tighter">Relatório de Campo</h1>
                <p class="opacity-80 font-bold uppercase text-xs tracking-widest">Controle de Reembolso</p>
                <div class="mt-6">
                    <p class="text-xl font-bold">${settings.userName}</p>
                    <p class="text-xs opacity-70">${dateStr}</p>
                </div>
            </div>
        </div>

        <div class="p-8">
            <div class="grid grid-cols-3 gap-4 mb-10">
                <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p class="text-[10px] font-black text-gray-400 uppercase mb-1">Total Gasto</p>
                    <p class="text-xl font-black text-gray-900">R$ ${totalSpent.toFixed(2)}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p class="text-[10px] font-black text-gray-400 uppercase mb-1">Adiantamento</p>
                    <p class="text-xl font-black text-gray-900">R$ ${settings.monthlyAdvance.toFixed(2)}</p>
                </div>
                <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <p class="text-[10px] font-black text-indigo-400 uppercase mb-1">Saldo Final</p>
                    <p class="text-xl font-black text-indigo-700">R$ ${balance.toFixed(2)}</p>
                </div>
            </div>

            ${settings.pixQrCode ? `
            <div class="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-10 flex flex-col items-center">
                <h3 class="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">Dados para Reembolso (PIX)</h3>
                <img src="${settings.pixQrCode}" class="w-40 h-40 object-contain bg-white p-2 rounded-2xl shadow-inner border border-emerald-200" alt="QR Code PIX" />
                <p class="text-[9px] font-bold text-emerald-600 mt-2 uppercase">Aponte a câmera para pagar</p>
            </div>
            ` : ''}

            <h3 class="font-black text-gray-800 uppercase text-xs mb-4 tracking-widest">Lista de Notas</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b-2 border-gray-100 text-gray-400 uppercase text-[10px]">
                            <th class="py-3 px-2">Data</th>
                            <th class="py-3 px-2">Categoria</th>
                            <th class="py-3 px-2">Descrição</th>
                            <th class="py-3 px-2 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        ${expenses.map(e => `
                            <tr>
                                <td class="py-4 px-2 font-bold">${new Date(e.date).toLocaleDateString('pt-BR')}</td>
                                <td class="py-4 px-2 font-black text-indigo-600">${e.category}</td>
                                <td class="py-4 px-2 text-gray-500">${e.description || ''}</td>
                                <td class="py-4 px-2 font-black text-right">R$ ${e.amount.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="mt-16 pt-10 border-t border-gray-100">
                <h3 class="font-black text-gray-800 uppercase text-xs mb-10 tracking-widest text-center">Anexos Fotográficos</h3>
                <div class="space-y-12">
                    ${expensesWithImages.map((e, i) => `
                        <div class="flex flex-col items-center">
                            <div class="w-full flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2 px-2">
                                <span>Anexo #${i + 1} - ${e.category}</span>
                                <span>Valor: R$ ${e.amount.toFixed(2)}</span>
                            </div>
                            ${e.receiptImage ? `<img src="${e.receiptImage}" class="max-w-full h-auto rounded-3xl shadow-lg border-4 border-white mb-4" />` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="mt-20 flex justify-center no-print">
                <button onclick="window.print()" class="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg">Imprimir ou Salvar PDF</button>
            </div>
        </div>
    </div>
</body>
</html>`;
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_${settings.userName.replace(/\s+/g, '_')}.html`;
    a.click();
  };

  const generateCSVReport = () => {
    let csvContent = `RELATORIO DE DESPESAS - ${settings.userName.toUpperCase()}\n`;
    csvContent += `Gerado em:;${dateStr}\n`;
    csvContent += `\nRESUMO FINANCEIRO\n`;
    csvContent += `Adiantamento:;R$ ${settings.monthlyAdvance.toFixed(2).replace('.', ',')}\n`;
    csvContent += `Gasto:;R$ ${totalSpent.toFixed(2).replace('.', ',')}\n`;
    csvContent += `Saldo:;R$ ${balance.toFixed(2).replace('.', ',')}\n\n`;
    
    csvContent += `Data;Categoria;Descricao;Valor (R$)\n`;
    expenses.forEach(e => {
      const formattedDate = new Date(e.date).toLocaleDateString('pt-BR');
      const formattedAmount = e.amount.toFixed(2).replace('.', ',');
      csvContent += `${formattedDate};${e.category};${e.description || ''};${formattedAmount}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Planilha_${settings.userName.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-50 overflow-y-auto pb-20">
      <div className="max-w-xl mx-auto p-4 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Exportar</h2>
          <div className="w-10"></div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-indigo-100 p-4 rounded-3xl text-indigo-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 leading-tight italic">Relatório HTML</h3>
            </div>
            <button onClick={generateDigitalReport} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95">
              Baixar Relatório (Com QR Code)
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-emerald-100 p-4 rounded-3xl text-emerald-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 leading-tight italic">Excel</h3>
            </div>
            <button onClick={generateCSVReport} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95">
              Baixar Planilha Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareReport;
