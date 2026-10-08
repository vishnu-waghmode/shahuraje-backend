import React, { useState, useEffect } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Products aani Orders donhi API sobat call kara
      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products`),
        fetch(`${API_BASE_URL}/api/orders`)
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      const productsList = Array.isArray(productsData) ? productsData : productsData.products || [];
      const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];

      // Pratyek product cha viklela stock calculate karne
      const salesMap = {};
      ordersList.forEach((order) => {
        // Jar order status 'Cancelled' naseel tarach count kara
        if (order.status !== 'Cancelled') {
          (order.items || []).forEach((item) => {
            const prodId = item.productId || item.product?._id || item._id;
            const quantity = Number(item.quantity) || 0;
            salesMap[prodId] = (salesMap[prodId] || 0) + quantity;
          });
        }
      });

      // Products sobat report merge karne
      const finalReport = productsList.map((prod) => {
        const soldCount = salesMap[prod._id] || 0;
        // Backend madhe stock field 'stock' kiva 'quantity' asel
        const currentStock = Number(prod.stock ?? prod.quantity ?? 0);
        const originalTotal = currentStock + soldCount;

        return {
          id: prod._id,
          name: prod.name || 'Unnamed Product',
          imageUrl: prod.imageUrl || prod.image || '',
          totalStock: originalTotal,
          sold: soldCount,
          remaining: currentStock
        };
      });

      setReportData(finalReport);
    } catch (err) {
      console.error('Report data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredData = reportData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CSV Report Download Function
  const handleDownload = () => {
    if (filteredData.length === 0) return;

    const headers = ['Product ID,Product Name,Total Stock,Sold,Remaining Stock'];
    const rows = filteredData.map(
      (item) => `"${item.id}","${item.name}",${item.totalStock},${item.sold},${item.remaining}`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">स्टॉक व इन्व्हेंटरी (Reports)</h1>
        <button
          onClick={handleDownload}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm text-sm cursor-pointer"
        >
          <Download size={18} />
          <span className="font-medium">रिपोर्ट डाउनलोड करा</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-end">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="उत्पादन शोधा..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-gray-500 gap-2">
              <Loader2 className="animate-spin text-[#154f30]" size={24} />
              <span>डेटा लोड होत आहे...</span>
            </div>
          ) : (
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
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-green-50 rounded border border-green-100 flex items-center justify-center text-[10px] text-[#154f30]">
                            Img
                          </div>
                        )}
                        {item.name}
                      </td>
                      <td className="p-4 text-center font-medium text-gray-600">{item.totalStock}</td>
                      <td className="p-4 text-center font-bold text-red-500">{item.sold}</td>
                      <td className="p-4 text-center font-bold text-[#154f30]">{item.remaining}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      कोणतीही माहिती सापडली नाही.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;