import React from 'react';
import { Search, Download } from 'lucide-react';

const reportData = [
  { id: 'P001', name: 'TATA रॅलिस झिंक 75% WP', totalStock: 50, sold: 10, remaining: 40 },
  { id: 'P002', name: 'Indofil M-45', totalStock: 76, sold: 10, remaining: 66 },
  { id: 'P003', name: 'Bayer Confidor', totalStock: 32, sold: 10, remaining: 22 },
  { id: 'P004', name: 'Yara Urea', totalStock: 100, sold: 20, remaining: 80 },
  { id: 'P005', name: 'DAP', totalStock: 60, sold: 15, remaining: 45 },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">स्टॉक व इन्व्हेंटरी (Reports)</h1>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm text-sm">
          <Download size={18} />
          <span className="font-medium">रिपोर्ट डाउनलोड करा</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-end">
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="उत्पादन शोधा..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold whitespace-nowrap">उत्पादनाचे नाव</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">एकूण स्टॉक</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">विक्री</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">शिल्लक स्टॉक</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {reportData.map((item, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded border border-green-100 flex items-center justify-center text-[10px] text-[#154f30]">Img</div>
                    {item.name}
                  </td>
                  <td className="p-4 text-center font-medium text-gray-600">{item.totalStock}</td>
                  <td className="p-4 text-center font-bold text-red-500">{item.sold}</td>
                  <td className="p-4 text-center font-bold text-[#154f30]">{item.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;