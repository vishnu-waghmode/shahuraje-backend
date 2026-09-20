import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      {/* उजवीकडील मुख्य भाग (64 = 16rem margin left to adjust for fixed sidebar) */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;