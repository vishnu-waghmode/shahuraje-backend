import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard'; 
import Orders from './pages/Orders'; 
import Products from './pages/Products'; 
import Reports from './pages/Reports'; 
import Settings from './pages/Settings'; 
import Login from './pages/Login'; // <- ही लाईन ऍड केली

// इथून const Login = () => ... ही जुनी लाईन पूर्णपणे काढून टाका

function App() {
  return (
    <Router>
      <Routes>
        {/* लॉगिन पेजसाठी Layout वापरलेला नाही, कारण तिथे साईडबार नको आहे */}
        <Route path="/" element={<Login />} />
        
        {/* AdminLayout मध्ये रॅप केलेले मुख्य राऊट्स */}
        <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/orders" element={<AdminLayout><Orders /></AdminLayout>} />
        <Route path="/products" element={<AdminLayout><Products /></AdminLayout>} />
        <Route path="/inventory" element={<AdminLayout><Products /></AdminLayout>} />
        <Route path="/reports" element={<AdminLayout><Reports /></AdminLayout>} />
        <Route path="/settings" element={<AdminLayout><Settings /></AdminLayout>} />
      </Routes>
    </Router>
  );
}

export default App;