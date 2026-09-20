import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Archive, BarChart2, Settings, LogOut, Leaf } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation(); // सध्या कोणते पेज चालू आहे हे ओळखण्यासाठी

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Archive size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart2 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-[#154f30] text-white flex flex-col fixed left-0 top-0 shadow-lg">
      
      {/* लोगो सेक्शन */}
      <div className="flex items-center gap-3 p-6 border-b border-green-800">
        <div className="bg-white text-[#154f30] p-2 rounded-full">
          <Leaf size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-wide">शाहूराजे</h2>
          <p className="text-xs text-green-200">कृषी केंद्र</p>
        </div>
      </div>

      {/* नेव्हिगेशन लिंक्स */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-[#154f30] font-bold shadow-md' // Figma प्रमाणे ॲक्टिव्ह पेज पांढऱ्या रंगात
                  : 'text-gray-200 hover:bg-[#1b613c] hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-[15px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* लॉगआउट बटण */}
      <div className="p-4 border-t border-green-800 mt-auto">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200 hover:bg-red-500 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="text-[15px]">Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;